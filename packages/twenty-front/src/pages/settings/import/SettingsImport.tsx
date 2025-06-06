import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useLingui } from '@lingui/react/macro';
import { useCallback, useEffect, useState } from 'react';
import { Section } from 'twenty-ui/layout';
import { computeMetadataNameFromLabel } from '~/pages/settings/data-model/utils/compute-metadata-name-from-label.utils';
import { ImportSummaryStep } from '~/pages/settings/import/components/ImportSummaryStep';
import { ColumnMapping } from '~/pages/settings/import/types/ColumnMapping';
import { CsvColumn } from '~/pages/settings/import/types/CsvColumn';
import { CsvRow } from '~/pages/settings/import/types/CsvRow';
import { ImportFormat } from '~/pages/settings/import/types/ImportFormat';
import { ImportSession } from '~/pages/settings/import/types/ImportSession';
import { ImportStep } from '~/pages/settings/import/types/ImportStep';
import { ImportSummary } from '~/pages/settings/import/types/ImportSummary';
import { ObjectConfiguration } from '~/pages/settings/import/types/ObjectConfiguration';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
import { CreateObjectStep } from './components/CreateObjectStep';
import { FormatSelectionStep } from './components/FormatSelectionStep';
import { ImportDataStep } from './components/ImportDataStep';
import { ImportSettingsStep } from './components/ImportSettingsStep';
import { UploadStep } from './components/UploadStep';
import { StyledProgressTracker } from './SettingsImport.styles';

import { parseCsvColumns, parseCsvRows } from './utils/csv.utils';
import { isReservedFieldName } from './utils/field.utils';
import { capitalizeFirst } from './utils/format.utils';

export const SettingsImport = () => {
  const { t } = useLingui();
  const { enqueueSnackBar } = useSnackBar();

  const [currentStep, setCurrentStep] = useState<ImportStep>('select-format');
  const [selectedFormat, setSelectedFormat] = useState<ImportFormat>('csv');
  const [csvColumns, setCsvColumns] = useState<CsvColumn[]>([]);
  const [csvRows, setCsvRows] = useState<CsvRow[]>([]);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping>({});
  const [, setUploadedFiles] = useState<File[]>([]);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importSession, setImportSession] = useState<ImportSession | null>(
    null,
  );
  const [objectConfig, setObjectConfig] = useState<ObjectConfiguration>({
    nameSingular: '',
    namePlural: '',
    description: '',
    icon: 'IconUser',
  });

  // State for sequential processing
  const [importQueue, setImportQueue] = useState<File[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [importSummaries, setImportSummaries] = useState<ImportSummary[]>([]);

  const resetToInitialState = useCallback(() => {
    setCurrentStep('select-format');
    setSelectedFormat('csv');
    setCsvColumns([]);
    setCsvRows([]);
    setColumnMappings({});
    setUploadedFiles([]);
    setIsCreating(false);
    setIsImporting(false);
    setImportSession(null);
    setObjectConfig({
      nameSingular: '',
      namePlural: '',
      description: '',
      icon: 'IconUser',
    });
    setImportQueue([]);
    setCurrentFileIndex(0);
    setImportSummaries([]);
  }, []);

  const advanceQueue = useCallback(
    (status: 'failed' | 'skipped', message: string) => {
      const currentFile = importQueue[currentFileIndex];
      if (currentFile !== undefined) {
        setImportSummaries((prev) => [
          ...prev,
          { fileName: currentFile.name, status, message },
        ]);
      }
      const nextIndex = currentFileIndex + 1;
      if (nextIndex >= importQueue.length) {
        setCurrentStep('import-summary');
      } else {
        setCurrentFileIndex(nextIndex);
      }
    },
    [currentFileIndex, importQueue],
  );

  const processFile = useCallback(
    (file: File) => {
      // Reset per-file state
      setCsvColumns([]);
      setCsvRows([]);
      setColumnMappings({});
      setImportSession(null);

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (!content) {
          advanceQueue('failed', 'File is empty or unreadable.');
          return;
        }

        if (selectedFormat === 'csv') {
          const columns = parseCsvColumns(content);
          const rows = parseCsvRows(content);
          if (columns.length === 0 || rows.length === 0) {
            advanceQueue('skipped', 'CSV file has no columns or data rows.');
            return;
          }

          setCsvColumns(columns);
          setCsvRows(rows);

          const initialMappings: ColumnMapping = {};
          columns.forEach((col) => {
            const fieldName = computeMetadataNameFromLabel(col.name);
            const shouldSkip = isReservedFieldName(fieldName);
            initialMappings[col.name] = {
              type: shouldSkip ? 'DO_NOT_IMPORT' : 'TEXT',
            };
          });
          setColumnMappings(initialMappings);

          const fileNameNoExt = file.name.replace(/\.[^/.]+$/, '');
          let sName = capitalizeFirst(fileNameNoExt.toLowerCase());
          const pName = sName.endsWith('s') ? sName : `${sName}s`;
          const fileName = file.name;
          if (
            sName.endsWith('s') &&
            sName.length > 1 &&
            !sName.endsWith('ss')
          ) {
            sName = sName.slice(0, -1);
          }
          setObjectConfig({
            nameSingular: sName,
            namePlural: pName,
            description: t`Records from ${fileName}`,
            icon: 'IconUser',
          });
          setCurrentStep('import-settings');
        }
      };

      reader.onerror = () => advanceQueue('failed', 'Error reading file.');
      reader.readAsText(file);
    },
    [selectedFormat, advanceQueue, t],
  );

  useEffect(() => {
    if (importQueue.length > 0 && currentFileIndex < importQueue.length) {
      processFile(importQueue[currentFileIndex]);
    }
  }, [currentFileIndex, importQueue, processFile]);

  const handleFormatNext = () => {
    setCurrentStep('upload-file');
  };

  const handleBackToFormat = () => setCurrentStep('select-format');

  const handleUploadNext = (files: File[]) => {
    setImportQueue(files);
    setCurrentFileIndex(0);
    setImportSummaries([]);
    // The useEffect will now trigger the processing of the first file
    // if the queue is not empty.
  };

  const handleBackToUpload = () => resetToInitialState();

  const handleSettingsNext = () => {
    setCurrentStep('create-object');
  };

  const handleCreateObjectNext = (session: ImportSession) => {
    setImportSession(session);
    setCurrentStep('import-data');
  };

  const handleBackToSettings = () => {
    setIsCreating(false);
    setCurrentStep('import-settings');
  };

  const handleImportComplete = (result: {
    importedRecordsCount: number;
    failedRecordsCount: number;
  }) => {
    const success = result.failedRecordsCount === 0;
    const resultImportedRecordsCount = result.importedRecordsCount;
    const csvRowsLength = csvRows.length;
    const message = t`Imported ${resultImportedRecordsCount} of ${csvRowsLength} records.`;
    enqueueSnackBar(message, {
      variant: success ? SnackBarVariant.Success : SnackBarVariant.Warning,
    });

    const currentFile = importQueue[currentFileIndex];
    if (currentFile !== undefined) {
      setImportSummaries((prev) => [
        ...prev,
        {
          fileName: currentFile.name,
          status: success ? 'success' : 'failed',
          message,
        },
      ]);
    }

    const nextIndex = currentFileIndex + 1;
    if (nextIndex >= importQueue.length) {
      setCurrentStep('import-summary');
    } else {
      setCurrentFileIndex(nextIndex);
    }
  };

  const handleBackToCreate = () => setCurrentStep('create-object');

  const isProcessingQueue =
    importQueue.length > 0 && currentStep !== 'upload-file';

  const fileIndex = currentFileIndex + 1;
  const importQueueLength = importQueue.length;

  return (
    <SubMenuTopBarContainer
      title={t({ id: 'import.pageTitle', message: 'Import Data' })}
      links={[
        {
          children: t({ id: 'breadcrumbs.workspace', message: 'Workspace' }),
          href: getSettingsPath(SettingsPath.Workspace),
        },
        { children: t({ id: 'breadcrumbs.import', message: 'Import' }) },
      ]}
    >
      <SettingsPageContainer>
        {isProcessingQueue && currentStep !== 'import-summary' && (
          <StyledProgressTracker>
            {t`Processing file ${fileIndex} of ${importQueueLength}`}:{' '}
            <strong>{importQueue[currentFileIndex]?.name}</strong>
          </StyledProgressTracker>
        )}
        <Section>
          {currentStep === 'select-format' && (
            <FormatSelectionStep
              selectedFormat={selectedFormat}
              onFormatChange={setSelectedFormat}
              onNext={handleFormatNext}
            />
          )}

          {currentStep === 'upload-file' && (
            <UploadStep
              selectedFormat={selectedFormat}
              onBack={handleBackToFormat}
              onNext={handleUploadNext}
              onFilesSelected={setUploadedFiles}
            />
          )}

          {currentStep === 'import-settings' && (
            <ImportSettingsStep
              csvColumns={csvColumns}
              columnMappings={columnMappings}
              onColumnMappingChange={setColumnMappings}
              objectConfig={objectConfig}
              onObjectConfigChange={setObjectConfig}
              onBack={handleBackToUpload}
              onNext={handleSettingsNext}
            />
          )}

          {currentStep === 'create-object' && (
            <CreateObjectStep
              objectConfig={objectConfig}
              columnMappings={columnMappings}
              onNext={handleCreateObjectNext}
              onBack={handleBackToSettings}
              onFailure={advanceQueue}
              isCreating={isCreating}
              setIsCreating={setIsCreating}
            />
          )}

          {currentStep === 'import-data' && importSession && (
            <ImportDataStep
              importSession={importSession}
              csvRows={csvRows}
              onComplete={handleImportComplete}
              onBack={handleBackToCreate}
              isImporting={isImporting}
              setIsImporting={setIsImporting}
            />
          )}

          {currentStep === 'import-summary' && (
            <ImportSummaryStep
              summaries={importSummaries}
              onRestart={resetToInitialState}
            />
          )}
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
