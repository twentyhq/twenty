import { serializePlainTextAsAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializePlainTextAsAdvancedTextEditorDocument';
import { useCanSendAgentChatMessage } from '@/ai/hooks/useCanSendAgentChatMessage';
import { useOpenAskAiPageWithPreprompt } from '@/ai/hooks/useOpenAskAiPageWithPreprompt';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { GETTING_STARTED_IMPORT_CONTEXT_STORE_INSTANCE_ID } from '@/getting-started/constants/GettingStartedImportContextStoreInstanceId';
import { GETTING_STARTED_IMPORT_PROMPT } from '@/getting-started/constants/GettingStartedImportPrompt';
import { SPREADSHEET_EXPORT_GUIDES } from '@/getting-started/constants/SpreadsheetExportGuides';
import { useUpdateGettingStarted } from '@/getting-started/hooks/useUpdateGettingStarted';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useOpenObjectRecordsSpreadsheetImportDialog } from '@/object-record/spreadsheet-import/hooks/useOpenObjectRecordsSpreadsheetImportDialog';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { SpreadsheetImportProvider } from '@/spreadsheet-import/provider/components/SpreadsheetImportProvider';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useDropzone } from 'react-dropzone';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { IconExternalLink, IconUpload } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';
import {
  GettingStartedStep,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

const StyledColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledDropZone = styled.div<{ isFileOver: boolean }>`
  align-items: center;
  background: ${({ isFileOver }) =>
    isFileOver
      ? themeCssVariables.background.tertiary
      : themeCssVariables.background.secondary};
  border: 1px dashed ${themeCssVariables.border.color.strong};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[6]} ${themeCssVariables.spacing[4]};
  text-align: center;
`;

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

export const GettingStartedImportAction = () => {
  const { t } = useLingui();
  const { updateGettingStarted } = useUpdateGettingStarted();
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Person,
  });
  const setContextStoreCurrentObjectMetadataItemId = useSetAtomComponentState(
    contextStoreCurrentObjectMetadataItemIdComponentState,
    GETTING_STARTED_IMPORT_CONTEXT_STORE_INSTANCE_ID,
  );
  const { openObjectRecordsSpreadsheetImportDialog } =
    useOpenObjectRecordsSpreadsheetImportDialog(CoreObjectNameSingular.Person);
  const { openAskAiPageWithPreprompt } = useOpenAskAiPageWithPreprompt();
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const canSendAgentChatMessage = useCanSendAgentChatMessage();
  const canImportWithAi = hasAiPermission && canSendAgentChatMessage;

  const importFilesWithAi = (files: File[]) => {
    void openAskAiPageWithPreprompt({
      serializedDocument: serializePlainTextAsAdvancedTextEditorDocument(
        t(GETTING_STARTED_IMPORT_PROMPT),
      ),
      mode: 'SEND',
      files,
    });
    void updateGettingStarted({
      completedStep: GettingStartedStep.IMPORT_DATA,
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: true,
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
        '.xlsx',
      ],
      'text/csv': ['.csv'],
    },
    onDropAccepted: importFilesWithAi,
  });

  const openImportDialog = () => {
    setContextStoreCurrentObjectMetadataItemId(objectMetadataItem.id);
    openObjectRecordsSpreadsheetImportDialog({
      uploadStepHook: async (importedRows) => {
        void updateGettingStarted({
          completedStep: GettingStartedStep.IMPORT_DATA,
        });

        return importedRows;
      },
    });
  };

  return (
    <ContextStoreComponentInstanceContext.Provider
      value={{ instanceId: GETTING_STARTED_IMPORT_CONTEXT_STORE_INSTANCE_ID }}
    >
      <SpreadsheetImportProvider>
        <StyledColumn>
          {canImportWithAi ? (
            <>
              <StyledDropZone
                // oxlint-disable-next-line react/jsx-props-no-spreading
                {...getRootProps()}
                isFileOver={isDragActive}
              >
                <input
                  // oxlint-disable-next-line react/jsx-props-no-spreading
                  {...getInputProps()}
                />
                <IconUpload />
                <Text size="sm">{t`Drop your CSV or Excel exports`}</Text>
                <Text
                  size="sm"
                  color="tertiary"
                >{t`AI maps the columns and links the records for you`}</Text>
              </StyledDropZone>
              <StyledRow>
                <Button
                  size="sm"
                  variant="link"
                  onClick={openImportDialog}
                >{t`Use the import wizard instead`}</Button>
              </StyledRow>
            </>
          ) : (
            <>
              <Text size="sm" color="tertiary">{t`Spreadsheet`}</Text>
              <Button
                size="sm"
                fullWidth
                startIcon={<IconUpload />}
                onClick={openImportDialog}
              >{t`Upload file`}</Button>
              <Text
                size="sm"
                color="tertiary"
              >{t`A CSV or Excel import from any tool`}</Text>
            </>
          )}
          <StyledRow>
            <Text size="sm" color="tertiary">{t`Export a CSV from`}</Text>
            {SPREADSHEET_EXPORT_GUIDES.map((guide) => (
              <Button
                key={guide.name}
                size="sm"
                variant="outline"
                href={guide.url}
                target="_blank"
                rel="noreferrer"
                endIcon={<IconExternalLink />}
              >
                {guide.name}
              </Button>
            ))}
          </StyledRow>
        </StyledColumn>
      </SpreadsheetImportProvider>
    </ContextStoreComponentInstanceContext.Provider>
  );
};
