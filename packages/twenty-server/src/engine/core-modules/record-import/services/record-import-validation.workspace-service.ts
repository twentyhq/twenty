import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import {
  computeSpreadsheetImportRowErrors,
  getSpreadsheetImportUniqueConstraints,
  getSpreadsheetImportUniqueValue,
  type ImportedStructuredRow,
  isDefined,
  normalizeSpreadsheetImportRows,
  type SpreadsheetImportRowErrors,
  type SpreadsheetImportValidationMessage,
} from 'twenty-shared/utils';

import { RecordImportSessionService } from 'src/engine/core-modules/record-import/services/record-import-session.service';
import { RecordImportStorageService } from 'src/engine/core-modules/record-import/services/record-import-storage.service';
import { type RecordImportContext } from 'src/engine/core-modules/record-import/services/record-import.workspace-service';
import {
  type RecordImportRow,
  type RecordImportRowEdit,
  type RecordImportSession,
} from 'src/engine/core-modules/record-import/types/record-import-session.type';

export type RecordImportRowValidation = RecordImportRow & {
  // Deleted in the review grid: never validated, shown or imported
  isDeleted: boolean;
  structuredRow: ImportedStructuredRow;
  errors: SpreadsheetImportRowErrors<SpreadsheetImportValidationMessage>;
};

// One validation for the review grid and the import: the mapping is
// applied to the stored rows, the shared rules run per chunk, and the in-file
// unique check, which needs every row, runs as a first pass.
@Injectable()
export class RecordImportValidationWorkspaceService {
  constructor(
    private readonly recordImportStorageService: RecordImportStorageService,
    private readonly recordImportSessionService: RecordImportSessionService,
  ) {}

  // assertIsCurrent runs after each chunk of the unique check, so a run
  // replaced by a newer edit stops before reading the whole file
  async *validateChunks(
    session: RecordImportSession,
    context: RecordImportContext,
    assertIsCurrent?: () => Promise<void>,
  ): AsyncGenerator<{ chunkIndex: number; rows: RecordImportRowValidation[] }> {
    const { spreadsheetImportFields } = context.metadata;
    const edits = await this.recordImportSessionService.findEdits(session);
    const duplicateCells = await this.findDuplicateCells(
      session,
      context,
      edits,
      assertIsCurrent,
    );

    for (
      let chunkIndex = 0;
      chunkIndex < (session.chunkCount ?? 0);
      chunkIndex++
    ) {
      const rows = await this.recordImportStorageService.readRowChunk(
        session,
        chunkIndex,
      );
      const structuredRows = this.normalizeRows(session, context, rows, edits);
      const { errors } =
        computeSpreadsheetImportRowErrors<SpreadsheetImportValidationMessage>({
          rows: structuredRows,
          fields: spreadsheetImportFields,
        });

      yield {
        chunkIndex,
        rows: rows.map(({ rowNumber, cells }, rowIndex) => {
          const isDeleted = edits.get(rowNumber)?.isDeleted === true;

          return {
            rowNumber,
            cells,
            isDeleted,
            structuredRow: structuredRows[rowIndex],
            errors: isDeleted
              ? {}
              : { ...errors[rowIndex], ...duplicateCells.get(rowNumber) },
          };
        }),
      };
    }
  }

  // Applies the mapping, then the values edited in the review grid
  normalizeRows(
    session: RecordImportSession,
    context: RecordImportContext,
    rows: RecordImportRow[],
    edits: Map<number, RecordImportRowEdit>,
  ): ImportedStructuredRow[] {
    return normalizeSpreadsheetImportRows(
      session.columns ?? [],
      rows.map(({ cells }) => cells),
      context.metadata.spreadsheetImportFields,
    ).map((structuredRow, rowIndex) => {
      const edit = edits.get(rows[rowIndex].rowNumber);

      if (!isDefined(edit)) {
        return structuredRow;
      }

      const editedRow = { ...structuredRow };

      for (const [fieldKey, value] of Object.entries(edit.values)) {
        editedRow[fieldKey] =
          value === null || value === '' ? undefined : value;
      }

      return editedRow;
    });
  }

  // Only the first row number per value is kept in memory, so the check
  // scales with distinct values rather than with cells.
  private async findDuplicateCells(
    session: RecordImportSession,
    context: RecordImportContext,
    edits: Map<number, RecordImportRowEdit>,
    assertIsCurrent?: () => Promise<void>,
  ) {
    const uniqueConstraints = getSpreadsheetImportUniqueConstraints(
      context.metadata.objectMetadataItem,
    );
    const firstRowNumberByValue = uniqueConstraints.map(
      () => new Map<string, number>(),
    );
    const duplicateRowNumbersByConstraint = uniqueConstraints.map(
      () => new Set<number>(),
    );

    for (
      let chunkIndex = 0;
      chunkIndex < (session.chunkCount ?? 0);
      chunkIndex++
    ) {
      const rows = await this.recordImportStorageService.readRowChunk(
        session,
        chunkIndex,
      );
      const structuredRows = this.normalizeRows(session, context, rows, edits);

      uniqueConstraints.forEach((uniqueConstraint, constraintIndex) => {
        const firstRowNumbers = firstRowNumberByValue[constraintIndex];
        const duplicates = duplicateRowNumbersByConstraint[constraintIndex];

        structuredRows.forEach((structuredRow, rowIndex) => {
          if (edits.get(rows[rowIndex].rowNumber)?.isDeleted === true) {
            return;
          }

          const uniqueValue = getSpreadsheetImportUniqueValue(
            structuredRow,
            uniqueConstraint,
          );

          if (!isNonEmptyString(uniqueValue)) {
            return;
          }

          const rowNumber = rows[rowIndex].rowNumber;
          const firstRowNumber = firstRowNumbers.get(uniqueValue);

          if (isDefined(firstRowNumber)) {
            duplicates.add(firstRowNumber);
            duplicates.add(rowNumber);
          } else {
            firstRowNumbers.set(uniqueValue, rowNumber);
          }
        });
      });

      await assertIsCurrent?.();
    }

    const duplicateCells = new Map<
      number,
      SpreadsheetImportRowErrors<SpreadsheetImportValidationMessage>
    >();

    uniqueConstraints.forEach((uniqueConstraint, constraintIndex) => {
      for (const rowNumber of duplicateRowNumbersByConstraint[
        constraintIndex
      ]) {
        const cells = duplicateCells.get(rowNumber) ?? {};

        for (const { columnName } of uniqueConstraint) {
          cells[columnName] = {
            level: 'error',
            message: { code: 'DUPLICATE_IN_IMPORT', fieldName: columnName },
          };
        }

        duplicateCells.set(rowNumber, cells);
      }
    });

    return duplicateCells;
  }
}
