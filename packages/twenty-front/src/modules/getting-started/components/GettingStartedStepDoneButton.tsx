import { GettingStartedChatThreadDoneButton } from '@/getting-started/components/GettingStartedChatThreadDoneButton';
import { GettingStartedWorkflowDoneButton } from '@/getting-started/components/GettingStartedWorkflowDoneButton';
import { GETTING_STARTED_CUSTOM_STEP_DONE_BUTTONS } from '@/getting-started/constants/GettingStartedCustomStepDoneButtons';
import { type GettingStartedStepDoneButtonProps } from '@/getting-started/types/GettingStartedStepDoneButtonProps';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';

import { GettingStartedStepKind } from '~/generated-metadata/graphql';

export const GettingStartedStepDoneButton = ({
  stepDefinition,
}: GettingStartedStepDoneButtonProps) => {
  switch (stepDefinition.kind) {
    case GettingStartedStepKind.PROMPT:
      return (
        <GettingStartedChatThreadDoneButton stepDefinition={stepDefinition} />
      );
    case GettingStartedStepKind.WORKFLOW:
      return (
        <GettingStartedWorkflowDoneButton
          stepActionKey={stepDefinition.actionKey}
        />
      );
    case GettingStartedStepKind.CUSTOM: {
      const CustomStepDoneButton =
        GETTING_STARTED_CUSTOM_STEP_DONE_BUTTONS[stepDefinition.actionKey];

      return isDefined(CustomStepDoneButton) ? (
        <CustomStepDoneButton stepDefinition={stepDefinition} />
      ) : null;
    }
    default:
      return assertUnreachable(stepDefinition.kind);
  }
};
