import { serializePlainTextAsAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializePlainTextAsAdvancedTextEditorDocument';
import { useCanSendAgentChatMessage } from '@/ai/hooks/useCanSendAgentChatMessage';
import { useOpenAskAiPageWithPreprompt } from '@/ai/hooks/useOpenAskAiPageWithPreprompt';
import { GettingStartedImportPreview } from '@/getting-started/components/step-preview/GettingStartedImportPreview';
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
import { themeCssVariables, useTheme } from 'twenty-ui/theme';
import { GettingStartedStepActionKey } from '~/generated-metadata/graphql';

const StyledColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledDropZone = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  border: 1px dashed ${themeCssVariables.border.color.strong};
  border-radius: ${themeCssVariables.border.radius.md};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  outline: none;
  padding: ${themeCssVariables.spacing[6]} ${themeCssVariables.spacing[4]};
  text-align: center;
  transition:
    background calc(${themeCssVariables.animation.duration.fast} * 1s) ease,
    border-color calc(${themeCssVariables.animation.duration.fast} * 1s) ease;

  &:hover,
  &:focus-visible {
    background: ${themeCssVariables.background.tertiary};
  }

  &:focus-visible,
  &[data-drag-active] {
    border-color: ${themeCssVariables.color.blue};
  }

  &[data-drag-active] {
    background: ${themeCssVariables.accent.quaternary};
    border-style: solid;
  }

  &[aria-disabled='true'] {
    cursor: not-allowed;
    opacity: 0.5;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const StyledDropZoneIcon = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  height: ${themeCssVariables.spacing[9]};
  justify-content: center;
  margin-bottom: ${themeCssVariables.spacing[2]};
  width: ${themeCssVariables.spacing[9]};
`;

const StyledDropZoneDescription = styled.div`
  max-width: 360px;
`;

const StyledExportRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

export const GettingStartedImportAction = () => {
  const { t } = useLingui();
  const theme = useTheme();
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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: true,
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
    <StyledColumn>
      <GettingStartedImportPreview />
      <StyledDropZone
        // oxlint-disable-next-line react/jsx-props-no-spreading
        {...getRootProps({
          role: 'button',
          'aria-label': t`Upload your CRM export`,
          'aria-disabled': !canSendAgentChatMessage,
        })}
        data-drag-active={isDragActive || undefined}
      >
        <input
          // oxlint-disable-next-line react/jsx-props-no-spreading
          {...getInputProps()}
        />
        <StyledDropZoneIcon>
          <IconUpload size={theme.icon.size.lg} />
        </StyledDropZoneIcon>
        <Text size="md" weight="medium" color="primary">
          {isDragActive
            ? t`Drop to start your import`
            : t`Drop your CSV or Excel from any tool`}
        </Text>
        <StyledDropZoneDescription>
          <Text size="sm" color="tertiary">
            {t`AI shapes your workspace around your data.`}
          </Text>
        </StyledDropZoneDescription>
      </StyledDropZone>
      <StyledExportRow>
        <Text
          size="sm"
          color="tertiary"
        >{t`Need an export? Get one from`}</Text>
        {SPREADSHEET_EXPORT_GUIDES.map((guide) => (
          <Button
            key={guide.name}
            render={<a href={guide.url} target="_blank" rel="noreferrer" />}
            nativeButton={false}
            startIcon={<guide.Icon size={theme.icon.size.md} />}
            endIcon={<IconExternalLink />}
          >
            {guide.name}
          </Button>
        ))}
      </StyledExportRow>
    </StyledColumn>
  );
};
