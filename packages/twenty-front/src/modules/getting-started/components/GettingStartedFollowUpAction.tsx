import { serializePlainTextAsAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializePlainTextAsAdvancedTextEditorDocument';
import { AiModelTierDropdown } from '@/ai/components/AiModelTierDropdown';
import { useCanSendAgentChatMessage } from '@/ai/hooks/useCanSendAgentChatMessage';
import { useOpenAskAiPageWithPreprompt } from '@/ai/hooks/useOpenAskAiPageWithPreprompt';
import { useUpdateGettingStarted } from '@/getting-started/hooks/useUpdateGettingStarted';
import { TextArea } from '@/ui/input/components/TextArea';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { IconButton } from 'twenty-ui/components/input';
import { IconArrowUp } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';
import { GettingStartedStep } from '~/generated-metadata/graphql';

const StyledColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledComposerActions = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
`;

export const GettingStartedFollowUpAction = () => {
  const { t } = useLingui();
  const [prompt, setPrompt] = useState(
    t`Every Monday, draft a follow-up email for each deal closing in the next 30 days.`,
  );
  const { openAskAiPageWithPreprompt } = useOpenAskAiPageWithPreprompt();
  const { updateGettingStarted } = useUpdateGettingStarted();
  const canSendAgentChatMessage = useCanSendAgentChatMessage();
  const trimmedPrompt = prompt.trim();

  const sendPrompt = () => {
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
      <StyledComposerActions>
        <AiModelTierDropdown dropdownId="getting-started-follow-up-model" />
        <IconButton
          size="sm"
          variant="solid"
          color="accent"
          shape="round"
          aria-label={t`Send instructions`}
          disabled={!canSendAgentChatMessage || trimmedPrompt === ''}
          onClick={sendPrompt}
        >
          <IconArrowUp />
        </IconButton>
      </StyledComposerActions>
    </StyledColumn>
  );
};
