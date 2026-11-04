import { GettingStartedChatThreadDoneCard } from '@/getting-started/components/GettingStartedChatThreadDoneCard';
import { GettingStartedPromptAction } from '@/getting-started/components/GettingStartedPromptAction';
import { GettingStartedWorkflowAction } from '@/getting-started/components/GettingStartedWorkflowAction';
import { GettingStartedWorkflowDoneCard } from '@/getting-started/components/GettingStartedWorkflowDoneCard';
import { GETTING_STARTED_CUSTOM_STEP_ACTIONS } from '@/getting-started/constants/GettingStartedCustomStepActions';
import { GETTING_STARTED_CUSTOM_STEP_DONE_ACTIONS } from '@/getting-started/constants/GettingStartedCustomStepDoneActions';
import { isDefined } from 'twenty-shared/utils';

import {
  type GettingStartedStepDefinition,
  GettingStartedStepKind,
} from '~/generated-metadata/graphql';

type GettingStartedStepActionProps = {
  stepDefinition: GettingStartedStepDefinition;
  isCompleted: boolean;
};

export const GettingStartedStepAction = ({
  stepDefinition,
  isCompleted,
}: GettingStartedStepActionProps) => {
  switch (stepDefinition.kind) {
    case GettingStartedStepKind.PROMPT:
      if (!isCompleted) {
        return <GettingStartedPromptAction stepDefinition={stepDefinition} />;
      }

      return isDefined(stepDefinition.doneChatThreadId) ? (
        <GettingStartedChatThreadDoneCard
          chatThreadId={stepDefinition.doneChatThreadId}
          fallbackTitle={stepDefinition.title}
        />
      ) : null;
    case GettingStartedStepKind.WORKFLOW:
      return isCompleted ? (
        <GettingStartedWorkflowDoneCard stepDefinition={stepDefinition} />
      ) : (
        <GettingStartedWorkflowAction
          stepActionKey={stepDefinition.actionKey}
        />
      );
    case GettingStartedStepKind.CUSTOM: {
      const CustomStepDoneAction = isCompleted
        ? GETTING_STARTED_CUSTOM_STEP_DONE_ACTIONS[stepDefinition.actionKey]
        : undefined;

      if (isDefined(CustomStepDoneAction)) {
        return <CustomStepDoneAction stepDefinition={stepDefinition} />;
      }

      const CustomStepAction =
        GETTING_STARTED_CUSTOM_STEP_ACTIONS[stepDefinition.actionKey];

      return isDefined(CustomStepAction) ? <CustomStepAction /> : null;
    }
  }
};
