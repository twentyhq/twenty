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

import { RecordImportStorageService } from 'src/engine/core-modules/record-import/services/record-import-storage.service';
import { type RecordImportContext } from 'src/engine/core-modules/record-import/services/record-import.workspace-service';
import {
  type RecordImportRow,
  type RecordImportSession,
} from 'src/engine/core-modules/record-import/types/record-import-session.type';

export type RecordImportRowValidation = {
  rowNumber: number;
  structuredRow: ImportedStructuredRow;
  errors: SpreadsheetImportRowErrors<SpreadsheetImportValidationMessage>;
};

// One validation for the review grid and the import (SEC-6): the mapping is
// applied to the stored rows, the shared rules run per chunk, and the in-file
// unique check, which needs every row, runs as a first pass.
@Injectable()
export class RecordImportValidationWorkspaceService {
  constructor(
    private readonly recordImportStorageService: RecordImportStorageService,
  ) {}

  async *validateChunks(
    session: RecordImportSession,
    context: RecordImportContext,
  ): AsyncGenerator<{ chunkIndex: number; rows: RecordImportRowValidation[] }> {
    const { spreadsheetImportFields } = context.metadata;
    const duplicateCells = await this.findDuplicateCells(session, context);

    for (
      let chunkIndex = 0;
      chunkIndex < (session.chunkCount ?? 0);
      chunkIndex++
    ) {
      const rows = await this.recordImportStorageService.readRowChunk(
        session,
        chunkIndex,
      );
      const structuredRows = this.normalizeRows(session, context, rows);
      const { errors } =
        computeSpreadsheetImportRowErrors<SpreadsheetImportValidationMessage>({
          rows: structuredRows,
          fields: spreadsheetImportFields,
        });

      yield {
        chunkIndex,
        rows: rows.map(({ rowNumber }, rowIndex) => ({
          rowNumber,
          structuredRow: structuredRows[rowIndex],
          errors: {
            ...errors[rowIndex],
            ...duplicateCells.get(rowNumber),
          },
        })),
      };
    }
  }

  normalizeRows(
    session: RecordImportSession,
    context: RecordImportContext,
    rows: RecordImportRow[],
  ): ImportedStructuredRow[] {
    return normalizeSpreadsheetImportRows(
      session.columns ?? [],
      rows.map(({ cells }) => cells),
      context.metadata.spreadsheetImportFields,
    );
  }

  // Only the first row number per value is kept in memory, so the check
  // scales with distinct values rather than with cells.
  private async findDuplicateCells(
    session: RecordImportSession,
    context: RecordImportContext,
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
      const structuredRows = this.normalizeRows(session, context, rows);

      uniqueConstraints.forEach((uniqueConstraint, constraintIndex) => {
        const firstRowNumbers = firstRowNumberByValue[constraintIndex];
        const duplicates = duplicateRowNumbersByConstraint[constraintIndex];

        structuredRows.forEach((structuredRow, rowIndex) => {
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
