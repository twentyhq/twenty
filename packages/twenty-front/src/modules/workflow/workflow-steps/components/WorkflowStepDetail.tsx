import {
  WorkflowAction,
  WorkflowTrigger,
  WorkflowVersion,
} from '@/workflow/types/Workflow';
import { assertUnreachable } from '@/workflow/utils/assertUnreachable';
import { getStepDefinitionOrThrow } from '@/workflow/utils/getStepDefinitionOrThrow';
import { WorkflowEditActionFormCreateRecord } from '@/workflow/workflow-steps/workflow-actions/components/WorkflowEditActionFormCreateRecord';
import { WorkflowEditActionFormDeleteRecord } from '@/workflow/workflow-steps/workflow-actions/components/WorkflowEditActionFormDeleteRecord';
import { WorkflowEditActionFormSendEmail } from '@/workflow/workflow-steps/workflow-actions/components/WorkflowEditActionFormSendEmail';
import { WorkflowEditActionFormUpdateRecord } from '@/workflow/workflow-steps/workflow-actions/components/WorkflowEditActionFormUpdateRecord';
import { WorkflowEditTriggerDatabaseEventForm } from '@/workflow/workflow-trigger/components/WorkflowEditTriggerDatabaseEventForm';
import { WorkflowEditTriggerManualForm } from '@/workflow/workflow-trigger/components/WorkflowEditTriggerManualForm';
import { Suspense, lazy } from 'react';
import { isDefined } from 'twenty-ui';
import { RightDrawerSkeletonLoader } from '~/loading/components/RightDrawerSkeletonLoader';

const WorkflowEditActionFormServerlessFunction = lazy(() =>
  import(
    '@/workflow/workflow-steps/workflow-actions/components/WorkflowEditActionFormServerlessFunction'
  ).then((module) => ({
    default: module.WorkflowEditActionFormServerlessFunction,
  })),
);

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
      if (!isDefined(stepDefinition.definition)) {
        throw new Error(
          'Expected the trigger to be defined at this point. Ensure the trigger has been set with a default value before trying to edit it.',
        );
      }

      switch (stepDefinition.definition.type) {
        case 'DATABASE_EVENT': {
          return (
            <WorkflowEditTriggerDatabaseEventForm
              trigger={stepDefinition.definition}
              triggerOptions={props}
            />
          );
        }
        case 'MANUAL': {
          return (
            <WorkflowEditTriggerManualForm
              trigger={stepDefinition.definition}
              triggerOptions={props}
            />
          );
        }
      }

      return assertUnreachable(
        stepDefinition.definition,
        `Expected the step to have an handler; ${JSON.stringify(stepDefinition)}`,
      );
    }
    case 'action': {
      switch (stepDefinition.definition.type) {
        case 'CODE': {
          return (
            <Suspense fallback={<RightDrawerSkeletonLoader />}>
              <WorkflowEditActionFormServerlessFunction
                key={stepId}
                action={stepDefinition.definition}
                actionOptions={props}
              />
            </Suspense>
          );
        }
        case 'SEND_EMAIL': {
          return (
            <WorkflowEditActionFormSendEmail
              key={stepId}
              action={stepDefinition.definition}
              actionOptions={props}
            />
          );
        }
        case 'CREATE_RECORD': {
          return (
            <WorkflowEditActionFormCreateRecord
              key={stepId}
              action={stepDefinition.definition}
              actionOptions={props}
            />
          );
        }

        case 'UPDATE_RECORD': {
          return (
            <WorkflowEditActionFormUpdateRecord
              key={stepId}
              action={stepDefinition.definition}
              actionOptions={props}
            />
          );
        }

        case 'DELETE_RECORD': {
          return (
            <WorkflowEditActionFormDeleteRecord
              key={stepId}
              action={stepDefinition.definition}
              actionOptions={props}
            />
          );
        }
      }

      return null;
    }
  }

  return assertUnreachable(
    stepDefinition,
    `Expected the step to have an handler; ${JSON.stringify(stepDefinition)}`,
  );
};
