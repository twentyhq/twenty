import { serializePlainTextAsAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializePlainTextAsAdvancedTextEditorDocument';
import { AiModelTierDropdown } from '@/ai/components/AiModelTierDropdown';
import { useCanSendAgentChatMessage } from '@/ai/hooks/useCanSendAgentChatMessage';
import { useOpenAskAiPageWithPreprompt } from '@/ai/hooks/useOpenAskAiPageWithPreprompt';
import { GETTING_STARTED_AI_THREAD_PROMPTS } from '@/getting-started/constants/GettingStartedAiThreadPrompts';
import { useUpdateGettingStarted } from '@/getting-started/hooks/useUpdateGettingStarted';
import { TextArea } from '@/ui/input/components/TextArea';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconButton } from 'twenty-ui/components/input';
import { IconArrowUp } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';
import {
  type GettingStartedStep,
  GettingStartedStepStatus,
} from '~/generated-metadata/graphql';

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

type GettingStartedAiThreadActionProps = {
  step: GettingStartedStep;
};

export const GettingStartedAiThreadAction = ({
  step,
}: GettingStartedAiThreadActionProps) => {
  const { t } = useLingui();
  const aiThreadPrompt = GETTING_STARTED_AI_THREAD_PROMPTS[step];
  const [prompt, setPrompt] = useState(
    isDefined(aiThreadPrompt) ? t(aiThreadPrompt.prompt) : '',
  );
  const { openAskAiPageWithPreprompt } = useOpenAskAiPageWithPreprompt();
  const { updateGettingStarted } = useUpdateGettingStarted();
  const canSendAgentChatMessage = useCanSendAgentChatMessage();
  const trimmedPrompt = prompt.trim();

  const sendPrompt = () => {
    const threadId = openAskAiPageWithPreprompt({
      serializedDocument:
        serializePlainTextAsAdvancedTextEditorDocument(trimmedPrompt),
      mode: 'SEND',
    });
    void updateGettingStarted({
      stepStatus: { step, status: GettingStartedStepStatus.DONE, threadId },
    });
  };

  return (
    <StyledColumn>
      <TextArea
        textAreaId={`getting-started-${step}-prompt`}
        label={isDefined(aiThreadPrompt) ? t(aiThreadPrompt.label) : undefined}
        minRows={3}
        value={prompt}
        onChange={setPrompt}
      />
      <StyledComposerActions>
        <AiModelTierDropdown dropdownId={`getting-started-${step}-model`} />
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
