import { GettingStartedAiThreadAction } from '@/getting-started/components/GettingStartedAiThreadAction';
import { GettingStartedWorkflowAction } from '@/getting-started/components/GettingStartedWorkflowAction';
import { GETTING_STARTED_BUILT_IN_STEP_ACTIONS } from '@/getting-started/constants/GettingStartedBuiltInStepActions';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';

import {
  type GettingStartedStepDefinition,
  GettingStartedStepKind,
} from '~/generated-metadata/graphql';

type GettingStartedStepActionProps = {
  step: GettingStartedStepDefinition;
};

export const GettingStartedStepAction = ({
  step: { key, kind },
}: GettingStartedStepActionProps) => {
  switch (kind) {
    case GettingStartedStepKind.WORKFLOW:
      return <GettingStartedWorkflowAction step={key} />;
    case GettingStartedStepKind.AI_THREAD:
      return <GettingStartedAiThreadAction step={key} />;
    case GettingStartedStepKind.BUILT_IN: {
      const BuiltInStepAction = GETTING_STARTED_BUILT_IN_STEP_ACTIONS[key];

      return isDefined(BuiltInStepAction) ? <BuiltInStepAction /> : null;
    }
    default:
      return assertUnreachable(kind);
  }
};
