import { serializePlainTextAsAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializePlainTextAsAdvancedTextEditorDocument';
import { useCanSendAgentChatMessage } from '@/ai/hooks/useCanSendAgentChatMessage';
import { useOpenAskAiPageWithPreprompt } from '@/ai/hooks/useOpenAskAiPageWithPreprompt';
import { GETTING_STARTED_IMPORT_PROMPT } from '@/getting-started/constants/GettingStartedImportPrompt';
import { SPREADSHEET_EXPORT_GUIDES } from '@/getting-started/constants/SpreadsheetExportGuides';
import { useUpdateGettingStarted } from '@/getting-started/hooks/useUpdateGettingStarted';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useDropzone } from 'react-dropzone';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { IconExternalLink, IconUpload } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';
import { GettingStartedStepActionKey } from '~/generated-metadata/graphql';

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

const StyledExportRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

export const GettingStartedImportAction = () => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();
  const { updateGettingStarted } = useUpdateGettingStarted();
  const { openAskAiPageWithPreprompt } = useOpenAskAiPageWithPreprompt();
  const canSendAgentChatMessage = useCanSendAgentChatMessage();

  const importFilesWithAi = async (files: File[]) => {
    const chatThreadId = await openAskAiPageWithPreprompt({
      serializedDocument: serializePlainTextAsAdvancedTextEditorDocument(
        t(GETTING_STARTED_IMPORT_PROMPT),
      ),
      mode: 'SEND',
      files,
    });

    if (!isDefined(chatThreadId)) {
      return;
    }

    void updateGettingStarted({
      completedStepActionKey: GettingStartedStepActionKey.IMPORT_DATA,
      completedStepChatThreadId: chatThreadId,
    });
  };

  const { getRootProps, getInputProps, open } = useDropzone({
    multiple: true,
    noClick: true,
    noKeyboard: true,
    disabled: !canSendAgentChatMessage,
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
        '.xlsx',
      ],
      'text/csv': ['.csv'],
    },
    onDropAccepted: (files) => void importFilesWithAi(files),
    onDropRejected: () =>
      enqueueToast({
        status: 'error',
        children: t`Only CSV and Excel files are supported`,
      }),
  });

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
          disabled={!canSendAgentChatMessage}
          onClick={open}
        >{t`Upload file`}</Button>
        <Text
          size="sm"
          color="light"
        >{t`A CSV or Excel export from any tool`}</Text>
      </StyledUploadField>
      <StyledExportRow>
        <Text size="sm" color="tertiary">{t`Export a CSV from`}</Text>
        {SPREADSHEET_EXPORT_GUIDES.map((guide) => (
          <Button
            key={guide.name}
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
