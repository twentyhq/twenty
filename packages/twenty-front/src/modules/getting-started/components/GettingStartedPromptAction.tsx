import { serializePlainTextAsAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializePlainTextAsAdvancedTextEditorDocument';
import { AiChatComposerActionsRow } from '@/ai/components/internal/AiChatComposerActionsRow';
import { useCanSendAgentChatMessage } from '@/ai/hooks/useCanSendAgentChatMessage';
import { useOpenAskAiPageWithPreprompt } from '@/ai/hooks/useOpenAskAiPageWithPreprompt';
import { GETTING_STARTED_PROMPTS } from '@/getting-started/constants/GettingStartedPrompts';
import { useUpdateGettingStarted } from '@/getting-started/hooks/useUpdateGettingStarted';
import { TextArea } from '@/ui/input/components/TextArea';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconButton } from 'twenty-ui/components/input';
import { IconArrowUp } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';
import { type GettingStartedStep } from '~/generated-metadata/graphql';

const StyledColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

type GettingStartedPromptActionProps = {
  step: GettingStartedStep;
};

export const GettingStartedPromptAction = ({
  step,
}: GettingStartedPromptActionProps) => {
  const { t } = useLingui();
  const stepPrompt = GETTING_STARTED_PROMPTS[step];
  const [prompt, setPrompt] = useState(
    isDefined(stepPrompt) ? t(stepPrompt.prompt) : '',
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
    void updateGettingStarted({ completedStep: step });
  };

  return (
    <StyledColumn>
      <TextArea
        textAreaId={`getting-started-${step}-prompt`}
        label={isDefined(stepPrompt) ? t(stepPrompt.label) : undefined}
        minRows={3}
        value={prompt}
        onChange={setPrompt}
      />
      <AiChatComposerActionsRow
        modelTierDropdownId={`getting-started-${step}-model`}
        sendButton={
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
        }
      />
    </StyledColumn>
  );
};
