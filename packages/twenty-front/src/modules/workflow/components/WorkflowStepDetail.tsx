import { WorkflowEditActionFormSendEmail } from '@/workflow/components/WorkflowEditActionFormSendEmail';
import { WorkflowEditActionFormServerlessFunction } from '@/workflow/components/WorkflowEditActionFormServerlessFunction';
import { WorkflowEditTriggerForm } from '@/workflow/components/WorkflowEditTriggerForm';
import {
  WorkflowAction,
  WorkflowTrigger,
  WorkflowVersion,
} from '@/workflow/types/Workflow';
import { assertUnreachable } from '@/workflow/utils/assertUnreachable';
import { getStepDefinitionOrThrow } from '@/workflow/utils/getStepDefinitionOrThrow';
import { isDefined } from 'twenty-ui';

type WorkflowStepDetailProps =
  | {
      stepId: string;
      workflowVersion: WorkflowVersion;
      readonly: true;
      onTriggerUpdate?: undefined;
      onActionUpdate?: undefined;
    }
  | {
      stepId: string;
      workflowVersion: WorkflowVersion;
      readonly?: false;
      onTriggerUpdate: (trigger: WorkflowTrigger) => void;
      onActionUpdate: (action: WorkflowAction) => void;
    };

export const WorkflowStepDetail = ({
  stepId,
  workflowVersion,
  ...props
}: WorkflowStepDetailProps) => {
  const stepDefinition = getStepDefinitionOrThrow({
    stepId,
    workflowVersion,
  });
  if (!isDefined(stepDefinition)) {
    return null;
  }

  switch (stepDefinition.type) {
    case 'trigger': {
      return (
        <WorkflowEditTriggerForm
          trigger={stepDefinition.definition}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...props}
        />
      );
    }
    case 'action': {
      switch (stepDefinition.definition.type) {
        case 'CODE': {
          return (
            <WorkflowEditActionFormServerlessFunction
              action={stepDefinition.definition}
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...props}
            />
          );
        }
        case 'SEND_EMAIL': {
          return (
            <WorkflowEditActionFormSendEmail
              action={stepDefinition.definition}
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...props}
            />
          );
        }
      }
    }
  }

  return assertUnreachable(
    stepDefinition,
    `Expected the step to have an handler; ${JSON.stringify(stepDefinition)}`,
  );
};
