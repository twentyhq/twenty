import { GettingStartedPromptAction } from '@/getting-started/components/GettingStartedPromptAction';
import { GettingStartedWorkflowAction } from '@/getting-started/components/GettingStartedWorkflowAction';
import { GETTING_STARTED_CUSTOM_STEP_ACTIONS } from '@/getting-started/constants/GettingStartedCustomStepActions';
import { isDefined } from 'twenty-shared/utils';

import {
  type GettingStartedStepDefinition,
  GettingStartedStepKind,
} from '~/generated-metadata/graphql';

type GettingStartedStepActionProps = {
  stepDefinition: GettingStartedStepDefinition;
};

export const GettingStartedStepAction = ({
  stepDefinition,
}: GettingStartedStepActionProps) => {
  switch (stepDefinition.kind) {
    case GettingStartedStepKind.PROMPT:
      return <GettingStartedPromptAction stepDefinition={stepDefinition} />;
    case GettingStartedStepKind.WORKFLOW:
      return <GettingStartedWorkflowAction step={stepDefinition.step} />;
    case GettingStartedStepKind.CUSTOM: {
      const CustomStepAction =
        GETTING_STARTED_CUSTOM_STEP_ACTIONS[stepDefinition.step];

      return isDefined(CustomStepAction) ? <CustomStepAction /> : null;
    }
  }
};
