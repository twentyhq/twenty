import { serializePlainTextAsAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializePlainTextAsAdvancedTextEditorDocument';
import { useCanSendAgentChatMessage } from '@/ai/hooks/useCanSendAgentChatMessage';
import { useOpenAskAiPageWithPreprompt } from '@/ai/hooks/useOpenAskAiPageWithPreprompt';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { GETTING_STARTED_IMPORT_CONTEXT_STORE_INSTANCE_ID } from '@/getting-started/constants/GettingStartedImportContextStoreInstanceId';
import { GETTING_STARTED_IMPORT_PROMPT } from '@/getting-started/constants/GettingStartedImportPrompt';
import { SPREADSHEET_EXPORT_GUIDES } from '@/getting-started/constants/SpreadsheetExportGuides';
import { useUpdateGettingStarted } from '@/getting-started/hooks/useUpdateGettingStarted';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useOpenObjectRecordsSpreadsheetImportDialog } from '@/object-record/spreadsheet-import/hooks/useOpenObjectRecordsSpreadsheetImportDialog';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
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
  gap: ${themeCssVariables.spacing[2]};
  outline: none;
`;

const StyledUploadField = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['0.5']};
`;

const StyledHelperRow = styled.div`
  align-items: baseline;
  display: flex;
  justify-content: space-between;
`;

const StyledExportRow = styled.div`
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

  const { getRootProps, getInputProps, open } = useDropzone({
    multiple: true,
    noClick: true,
    noKeyboard: true,
    disabled: !canImportWithAi,
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
    <StyledColumn
      // oxlint-disable-next-line react/jsx-props-no-spreading
      {...getRootProps()}
    >
      <input
        // oxlint-disable-next-line react/jsx-props-no-spreading
        {...getInputProps()}
      />
      <StyledUploadField>
        <Text size="xs" color="light">{t`Spreadsheet`}</Text>
        <Button
          fullWidth
          startIcon={<IconUpload />}
          onClick={canImportWithAi ? open : openImportDialog}
        >{t`Upload file`}</Button>
        <StyledHelperRow>
          <Text
            size="sm"
            color="light"
          >{t`A CSV or Excel export from any tool`}</Text>
          {canImportWithAi && (
            <Button
              variant="link"
              onClick={openImportDialog}
            >{t`Use the import wizard instead`}</Button>
          )}
        </StyledHelperRow>
      </StyledUploadField>
      <StyledExportRow>
        <Text size="sm" color="tertiary">{t`Export a CSV from`}</Text>
        {SPREADSHEET_EXPORT_GUIDES.map((guide) => (
          <Button
            key={guide.name}
            // An href Button renders its label only, so the anchor is passed in to keep the icon
            render={<a href={guide.url} target="_blank" rel="noreferrer" />}
            nativeButton={false}
            endIcon={<IconExternalLink />}
          >
            {guide.name}
          </Button>
        ))}
      </StyledExportRow>
    </StyledColumn>
  );
};
