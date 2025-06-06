import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconCheck,
  IconDatabase,
  IconSettings,
  IconUpload,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { useFlexibleCreateOneRecord } from '../hooks/useFlexibleCreateOneRecord';
import {
  StyledImportDataContainer,
  StyledImportProgress,
  StyledImportStats,
  StyledNavigationButtons,
  StyledProgressContent,
  StyledProgressHeader,
  StyledProgressIcon,
  StyledProgressTitle,
  StyledStatItem,
  StyledStatLabel,
  StyledStatNumber,
  StyledSuccessCard,
  StyledSuccessIcon,
  StyledSuccessText,
} from '../SettingsImport.styles';
import { CsvRow } from '../types/CsvRow';
import { ImportSession } from '../types/ImportSession';

import { convertCsvValueToFieldType } from '../utils/csv.utils';
import { Heading } from './Heading';

const importDataRecords = async (
  importSession: ImportSession,
  createOneRecord: (
    objectNameSingular: string,
    recordInput: Record<string, any>,
  ) => Promise<any>,
): Promise<{ importedRecordsCount: number; failedRecordsCount: number }> => {
  let importedRecordsCount = 0;
  let failedRecordsCount = 0;

  for (const [rowIndex, row] of importSession.csvRows.entries()) {
    try {
      const recordData: Record<string, any> = {};
      for (const fieldResult of importSession.fields) {
        const csvValue = row[fieldResult.columnName];
        if (csvValue !== undefined && csvValue !== null && csvValue !== '') {
          recordData[fieldResult.field.name] = convertCsvValueToFieldType(
            csvValue,
            fieldResult.field.type,
          );
        }
      }
      if (Object.keys(recordData).length > 0) {
        await createOneRecord(importSession.objectNameSingular, recordData);
        importedRecordsCount++;

        // Pequeno delay entre registros
        if (rowIndex < importSession.csvRows.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      }
    } catch (recordError: any) {
      //todo
      failedRecordsCount++;
      // NOTE: Removed snackbar from here to avoid flooding the UI.
      // The summary at the end is more appropriate for batch processing.
    }
  }

  return { importedRecordsCount, failedRecordsCount };
};

export const ImportDataStep = ({
  importSession,
  csvRows,
  onComplete,
  onBack,
  isImporting,
  setIsImporting,
}: {
  importSession: ImportSession;
  csvRows: CsvRow[];
  onComplete: (result: {
    importedRecordsCount: number;
    failedRecordsCount: number;
  }) => void;
  onBack: () => void;
  isImporting: boolean;
  setIsImporting: (importing: boolean) => void;
}) => {
  const { t } = useLingui();
  const { createOneRecord } = useFlexibleCreateOneRecord();
  const [importStats, setImportStats] = useState({ imported: 0, failed: 0 });

  const handleImport = async () => {
    setIsImporting(true);
    try {
      const sessionToUse = { ...importSession, csvRows };

      const result = await importDataRecords(sessionToUse, createOneRecord);

      setImportStats({
        imported: result.importedRecordsCount,
        failed: result.failedRecordsCount,
      });

      // Wait a bit for the user to see the stats before moving on
      await new Promise((resolve) => setTimeout(resolve, 1500));
      onComplete(result);
    } catch (error: any) {
      onComplete({
        importedRecordsCount: importStats.imported,
        failedRecordsCount: csvRows.length - importStats.imported,
      });
    } finally {
      setIsImporting(false);
    }
  };

  const nameSingular = importSession.objectNameSingular;
  return (
    <StyledImportDataContainer>
      <Heading
        title={t({
          id: 'importData.title',
          message: 'Import Data',
        })}
        description={t({
          id: 'importData.description',
          message: 'Ready to import data into your new object.',
        })}
      />

      <StyledSuccessCard>
        <StyledSuccessIcon>
          <IconCheck size={16} />
        </StyledSuccessIcon>
        <StyledSuccessText>
          {t`Object "${nameSingular}" created successfully!`}
        </StyledSuccessText>
      </StyledSuccessCard>

      <StyledImportProgress>
        <StyledProgressHeader>
          <StyledProgressIcon>
            <IconUpload size={16} />
          </StyledProgressIcon>
          <StyledProgressTitle>
            {t({
              id: 'importData.progress.title',
              message: 'Data Import',
            })}
          </StyledProgressTitle>
        </StyledProgressHeader>
        <StyledProgressContent>
          <StyledImportStats>
            <StyledStatItem>
              <IconDatabase size={16} />
              <StyledStatNumber>{csvRows.length}</StyledStatNumber>
              <StyledStatLabel>
                {t({
                  id: 'importData.rowsToImport',
                  message: 'rows to import',
                })}
              </StyledStatLabel>
            </StyledStatItem>
            <StyledStatItem>
              <IconSettings size={16} />
              <StyledStatNumber>{importSession.fields.length}</StyledStatNumber>
              <StyledStatLabel>
                {t({
                  id: 'importData.fieldsCreated',
                  message: 'fields created',
                })}
              </StyledStatLabel>
            </StyledStatItem>
            {(importStats.imported > 0 || importStats.failed > 0) && (
              <>
                <StyledStatItem>
                  <IconCheck size={16} />
                  <StyledStatNumber>{importStats.imported}</StyledStatNumber>
                  <StyledStatLabel>
                    {t({
                      id: 'importData.imported',
                      message: 'imported',
                    })}
                  </StyledStatLabel>
                </StyledStatItem>
                <StyledStatItem>
                  <IconAlertTriangle size={16} />
                  <StyledStatNumber>{importStats.failed}</StyledStatNumber>
                  <StyledStatLabel>
                    {t({
                      id: 'importData.failed',
                      message: 'failed',
                    })}
                  </StyledStatLabel>
                </StyledStatItem>
              </>
            )}
          </StyledImportStats>
        </StyledProgressContent>
      </StyledImportProgress>

      <StyledNavigationButtons>
        <Button
          Icon={IconArrowLeft}
          title={t({ id: 'importData.back', message: 'Back' })}
          variant="secondary"
          onClick={onBack}
          disabled={isImporting}
        />
        <Button
          Icon={IconUpload}
          title={
            isImporting
              ? t({ id: 'importData.importing', message: 'Importing...' })
              : t({
                  id: 'importData.importNow',
                  message: 'Import Now',
                })
          }
          accent="blue"
          onClick={handleImport}
          disabled={isImporting}
        />
      </StyledNavigationButtons>
    </StyledImportDataContainer>
  );
};
