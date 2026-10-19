import { serializePlainTextAsAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializePlainTextAsAdvancedTextEditorDocument';
import { AiModelTierDropdown } from '@/ai/components/AiModelTierDropdown';
import { AgentChatContextPreview } from '@/ai/components/internal/AgentChatContextPreview';
import { AgentChatFileInput } from '@/ai/components/internal/AgentChatFileInput';
import { useCanSendAgentChatMessage } from '@/ai/hooks/useCanSendAgentChatMessage';
import { useOpenAskAiPageWithPreprompt } from '@/ai/hooks/useOpenAskAiPageWithPreprompt';
import { agentChatSelectedFilesState } from '@/ai/states/agentChatSelectedFilesState';
import { useUpdateGettingStarted } from '@/getting-started/hooks/useUpdateGettingStarted';
import { TextArea } from '@/ui/input/components/TextArea';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useRef, useState } from 'react';
import { IconButton } from 'twenty-ui/components/input';
import { IconArrowUp, IconPaperclip } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';
import { GettingStartedStep } from '~/generated-metadata/graphql';

const StyledColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledComposerFooter = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const StyledComposerActions = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

export const GettingStartedFollowUpAction = () => {
  const { t } = useLingui();
  const [prompt, setPrompt] = useState(
    t`Every Monday, draft a follow-up email for each deal closing in the next 30 days.`,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const agentChatSelectedFiles = useAtomStateValue(agentChatSelectedFilesState);
  const { openAskAiPageWithPreprompt } = useOpenAskAiPageWithPreprompt();
  const { updateGettingStarted } = useUpdateGettingStarted();
  const canSendAgentChatMessage = useCanSendAgentChatMessage();
  const trimmedPrompt = prompt.trim();
  const isUploading = agentChatSelectedFiles.length > 0;

  const sendFollowUpPrompt = () => {
    openAskAiPageWithPreprompt({
      serializedDocument:
        serializePlainTextAsAdvancedTextEditorDocument(trimmedPrompt),
      mode: 'SEND',
    });
    void updateGettingStarted({
      completedStep: GettingStartedStep.FOLLOW_UP_DEALS,
    });
  };

  return (
    <StyledColumn>
      <TextArea
        textAreaId="getting-started-follow-up-prompt"
        label={t`Follow-up instructions`}
        minRows={3}
        value={prompt}
        onChange={setPrompt}
      />
      <AgentChatFileInput ref={fileInputRef} />
      <AgentChatContextPreview />
      <StyledComposerFooter>
        <IconButton
          size="sm"
          variant="ghost"
          aria-label={t`Attach files`}
          loading={isUploading}
          onClick={() => fileInputRef.current?.click()}
        >
          <IconPaperclip />
        </IconButton>
        <StyledComposerActions>
          <AiModelTierDropdown dropdownId="getting-started-follow-up-model" />
          <IconButton
            size="sm"
            variant="solid"
            color="accent"
            shape="round"
            aria-label={t`Send follow-up instructions`}
            disabled={
              !canSendAgentChatMessage || trimmedPrompt === '' || isUploading
            }
            onClick={sendFollowUpPrompt}
          >
            <IconArrowUp />
          </IconButton>
        </StyledComposerActions>
      </StyledComposerFooter>
    </StyledColumn>
  );
};
