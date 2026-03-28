import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useGenerateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/hooks/useGenerateDepthRecordGqlFieldsFromObject';
import {
  useBatchCreateManyRecords,
  type ImportRecordWarning,
} from '@/object-record/hooks/useBatchCreateManyRecords';
import { useBuildSpreadsheetImportFields } from '@/object-record/spreadsheet-import/hooks/useBuildSpreadSheetImportFields';
import { buildRecordFromImportedStructuredRow } from '@/object-record/spreadsheet-import/utils/buildRecordFromImportedStructuredRow';
import { executeRelationUpdatesViaMutation } from '@/object-record/spreadsheet-import/utils/executeRelationUpdatesViaMutation';
import { extractRelationUpdatesFromImportedRows } from '@/object-record/spreadsheet-import/utils/extractRelationUpdatesFromImportedRows';
import { spreadsheetImportFilterAvailableFieldMetadataItems } from '@/object-record/spreadsheet-import/utils/spreadsheetImportFilterAvailableFieldMetadataItems';
import { spreadsheetImportGetUnicityTableHook } from '@/object-record/spreadsheet-import/utils/spreadsheetImportGetUnicityTableHook';
import { ImportResultsSummary } from '@/spreadsheet-import/components/ImportResultsSummary';
import { SPREADSHEET_IMPORT_CREATE_RECORDS_BATCH_SIZE } from '@/spreadsheet-import/constants/SpreadsheetImportCreateRecordsBatchSize';
import { useOpenSpreadsheetImportDialog } from '@/spreadsheet-import/hooks/useOpenSpreadsheetImportDialog';
import { spreadsheetImportCreatedRecordsProgressState } from '@/spreadsheet-import/states/spreadsheetImportCreatedRecordsProgressState';
import { type SpreadsheetImportDialogOptions } from '@/spreadsheet-import/types';
import {
  applyLeadResolutions,
  decideResolution,
  type LeadResolution,
  type LeadResolutionResult,
} from '@/spreadsheet-import/utils/applyLeadResolutions';
import { findLeadCandidates } from '@/spreadsheet-import/utils/findLeadCandidates';
import {
  extractLeadCsvData,
  scoreLeadMatch,
} from '@/spreadsheet-import/utils/scoreLeadMatch';
import { useDialogManager } from '@/ui/feedback/dialog-manager/hooks/useDialogManager';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { t } from '@lingui/core/macro';
import React from 'react';

/**
 * Runs fuzzy Lead resolution for import warnings where a relation connect
 * failed. Searches for candidate Leads by email/name, scores them, and
 * auto-resolves matches ≥95% confidence.
 */
const runFuzzyLeadResolution = async ({
  warnings,
  originalRows,
  apolloClient,
  parentObjectNameSingular,
}: {
  warnings: ImportRecordWarning[];
  originalRows: Record<string, unknown>[];
  apolloClient: any;
  parentObjectNameSingular: string;
}): Promise<LeadResolutionResult | null> => {
  // Filter to only relation connect warnings (not other types)
  const connectWarnings = warnings.filter(
    (w) =>
      w.reason === 'CONNECT_NOT_FOUND' || w.reason === 'CONNECT_AMBIGUOUS',
  );

  if (connectWarnings.length === 0) return null;

  // Group warnings by target object (e.g., "lead", "agent")
  // For now, process each relation type
  const warningsByRelation = new Map<string, ImportRecordWarning[]>();

  for (const warning of connectWarnings) {
    const key = warning.connectFieldName;
    if (!warningsByRelation.has(key)) {
      warningsByRelation.set(key, []);
    }
    warningsByRelation.get(key)!.push(warning);
  }

  const allResolutions: LeadResolution[] = [];

  for (const [relationFieldName, relationWarnings] of warningsByRelation) {
    // Extract CSV data for each warning row
    const csvDataByPolicyId = new Map<
      string,
      ReturnType<typeof extractLeadCsvData>
    >();

    for (const warning of relationWarnings) {
      if (!warning.recordId) continue;

      const originalRow = originalRows.find(
        (row) => row['id'] === warning.recordId,
      );
      if (!originalRow) continue;

      const csvData = extractLeadCsvData(originalRow, relationFieldName);

      // Only proceed if we have enough data to fuzzy match
      if (!csvData.email && !csvData.firstName) continue;

      csvDataByPolicyId.set(warning.recordId, csvData);
    }

    if (csvDataByPolicyId.size === 0) continue;

    // Find candidate Leads
    const targetObjectNameSingular =
      relationWarnings[0]?.targetObjectName ?? 'person';

    // Derive plural from singular (simple pluralization)
    const targetObjectNamePlural = targetObjectNameSingular.endsWith('s')
      ? targetObjectNameSingular + 'es'
      : targetObjectNameSingular === 'person'
        ? 'people'
        : targetObjectNameSingular + 's';

    const candidates = await findLeadCandidates({
      apolloClient,
      targetObjectNameSingular,
      targetObjectNamePlural,
      csvDataRows: [...csvDataByPolicyId.values()],
    });

    // Score candidates against each warning row and decide resolutions
    for (const [policyId, csvData] of csvDataByPolicyId) {
      const scores = candidates.map((candidate) =>
        scoreLeadMatch(candidate, csvData),
      );

      // Sort by score descending
      scores.sort((a, b) => b.score - a.score);
      const bestMatch = scores.length > 0 ? scores[0] : null;

      // Find existing leadId on the warning
      const warning = relationWarnings.find((w) => w.recordId === policyId);
      const existingLeadId = undefined; // We don't have this readily; the skip preserved it

      const resolution = decideResolution({
        bestMatch,
        existingLeadId,
        policyId,
        csvData,
      });

      allResolutions.push(resolution);
    }
  }

  if (allResolutions.length === 0) return null;

  // Apply auto-resolve and create decisions
  const resolutionsToApply = allResolutions.filter(
    (r) => r.action !== 'review' && r.action !== 'skip',
  );

  const targetObjectName =
    connectWarnings[0]?.targetObjectName ?? 'person';

  const result = await applyLeadResolutions({
    apolloClient,
    resolutions: resolutionsToApply,
    parentObjectNameSingular,
    targetObjectNameSingular: targetObjectName,
  });

  // Add flagged-for-review from resolutions that weren't applied
  const reviewResolutions = allResolutions.filter(
    (r) => r.action === 'review',
  );
  result.flaggedForReview.push(...reviewResolutions);

  return result;
};

export const useOpenObjectRecordsSpreadsheetImportDialog = (
  objectNameSingular: string,
) => {
  const apolloCoreClient = useApolloCoreClient();
  const { openSpreadsheetImportDialog } = useOpenSpreadsheetImportDialog();
  const { buildSpreadsheetImportFields } = useBuildSpreadsheetImportFields();
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();
  const { enqueueDialog } = useDialogManager();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const setSpreadsheetImportCreatedRecordsProgress = useSetAtomState(
    spreadsheetImportCreatedRecordsProgressState,
  );

  const abortController = new AbortController();

  const { recordGqlFields } = useGenerateDepthRecordGqlFieldsFromObject({
    objectNameSingular,
    depth: 0,
  });

  const { batchCreateManyRecords } = useBatchCreateManyRecords({
    objectNameSingular,
    recordGqlFields,
    mutationBatchSize: SPREADSHEET_IMPORT_CREATE_RECORDS_BATCH_SIZE,
    setBatchedRecordsCount: setSpreadsheetImportCreatedRecordsProgress,
    abortController,
  });

  const openObjectRecordsSpreadsheetImportDialog = (
    options?: Omit<
      SpreadsheetImportDialogOptions,
      'fields' | 'isOpen' | 'onClose'
    >,
  ) => {
    const availableFieldMetadataItemsToImport =
      spreadsheetImportFilterAvailableFieldMetadataItems(
        objectMetadataItem.updatableFields,
      );

    const spreadsheetImportFields = buildSpreadsheetImportFields(
      availableFieldMetadataItemsToImport,
    );

    openSpreadsheetImportDialog({
      ...options,
      onSubmit: async (data) => {
        const createInputs = data.validStructuredRows.map((record) => {
          const fieldMapping: Record<string, any> =
            buildRecordFromImportedStructuredRow({
              importedStructuredRow: record,
              fieldMetadataItems: availableFieldMetadataItemsToImport,
              spreadsheetImportFields,
            });

          return fieldMapping;
        });

        const relationUpdates = extractRelationUpdatesFromImportedRows({
          importedStructuredRows: data.validStructuredRows,
          spreadsheetImportFields,
          fieldMetadataItems: availableFieldMetadataItemsToImport,
          objectMetadataItems: objectMetadataItems ?? [],
        });

        try {
          const { warnings, failures } = await batchCreateManyRecords({
            recordsToCreate: createInputs,
            upsert: true,
          });

          if (relationUpdates.length > 0) {
            await executeRelationUpdatesViaMutation({
              apolloClient: apolloCoreClient,
              relationUpdates,
              batchSize: SPREADSHEET_IMPORT_CREATE_RECORDS_BATCH_SIZE,
            });
          }

          // Run fuzzy Lead resolution for connect warnings
          let fuzzyResult: LeadResolutionResult | null = null;

          if (warnings.length > 0) {
            fuzzyResult = await runFuzzyLeadResolution({
              warnings,
              originalRows: data.validStructuredRows,
              apolloClient: apolloCoreClient,
              parentObjectNameSingular: objectNameSingular,
            });
          }

          const evictFieldNames = new Set([objectMetadataItem.namePlural]);

          for (const update of relationUpdates) {
            evictFieldNames.add(update.targetObjectMetadataItem.namePlural);
          }

          // Also evict person/lead cache if fuzzy resolution ran
          if (fuzzyResult) {
            evictFieldNames.add('people');
          }

          await apolloCoreClient.refetchQueries({
            updateCache: (cache) => {
              for (const fieldName of evictFieldNames) {
                cache.evict({ fieldName });
              }
            },
          });

          // Compute remaining warnings (subtract auto-resolved ones)
          const autoResolvedCount =
            (fuzzyResult?.autoResolved ?? 0) + (fuzzyResult?.created ?? 0);
          const remainingWarnings = warnings.length - autoResolvedCount;
          const reviewCount = fuzzyResult?.flaggedForReview?.length ?? 0;

          const hasIssues =
            remainingWarnings > 0 || failures.length > 0 || reviewCount > 0;

          if (hasIssues || autoResolvedCount > 0) {
            const totalRecords = data.validStructuredRows.length;
            const successCount =
              totalRecords -
              remainingWarnings -
              failures.length +
              autoResolvedCount;
            const columns = spreadsheetImportFields.map((field) => ({
              key: field.key,
              label: field.label,
            }));

            enqueueDialog({
              title: t`Import Results`,
              children: React.createElement(ImportResultsSummary, {
                totalRecords,
                successCount,
                warnings: warnings.slice(autoResolvedCount),
                failures,
                originalRows: data.validStructuredRows,
                columns,
                objectNameSingular,
                fuzzyResolutionResult: fuzzyResult ?? undefined,
              }),
              buttons: [
                {
                  title: t`Close`,
                  variant: 'secondary' as const,
                  role: 'confirm' as const,
                },
              ],
            });
          } else {
            enqueueSuccessSnackBar({
              message: t`${data.validStructuredRows.length} records imported successfully.`,
            });
          }
        } catch (error: any) {
          enqueueErrorSnackBar({
            apolloError: error,
          });
        }
      },
      spreadsheetImportFields,
      availableFieldMetadataItems: availableFieldMetadataItemsToImport,
      onAbortSubmit: () => {
        abortController.abort();
      },
      tableHook: spreadsheetImportGetUnicityTableHook(objectMetadataItem),
    });
  };

  return {
    openObjectRecordsSpreadsheetImportDialog,
  };
};
