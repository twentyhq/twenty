import {
  type WorkflowAction,
  type WorkflowRunStepStatus,
  type WorkflowTrigger,
} from '@/workflow/types/Workflow';
import { getStepDefinitionOrThrow } from '@/workflow/utils/getStepDefinitionOrThrow';
import { WorkflowEditActionAiAgent } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/components/WorkflowEditActionAiAgent';
import { WorkflowActionServerlessFunction } from '@/workflow/workflow-steps/workflow-actions/code-action/components/WorkflowActionServerlessFunction';
import { WorkflowEditActionCreateRecord } from '@/workflow/workflow-steps/workflow-actions/components/WorkflowEditActionCreateRecord';
import { WorkflowEditActionDeleteRecord } from '@/workflow/workflow-steps/workflow-actions/components/WorkflowEditActionDeleteRecord';
import { WorkflowEditActionEmpty } from '@/workflow/workflow-steps/workflow-actions/components/WorkflowEditActionEmpty';
import { WorkflowEditActionSendEmail } from '@/workflow/workflow-steps/workflow-actions/components/WorkflowEditActionSendEmail';
import { WorkflowEditActionUpdateRecord } from '@/workflow/workflow-steps/workflow-actions/components/WorkflowEditActionUpdateRecord';
import { WorkflowEditActionUpsertRecord } from '@/workflow/workflow-steps/workflow-actions/components/WorkflowEditActionUpsertRecord';
import { WorkflowEditActionDelay } from '@/workflow/workflow-steps/workflow-actions/delay-actions/components/WorkflowEditActionDelay';
import { WorkflowEditActionFilter } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/WorkflowEditActionFilter';
import { WorkflowEditActionFindRecords } from '@/workflow/workflow-steps/workflow-actions/find-records-action/components/WorkflowEditActionFindRecords';
import { WorkflowEditActionIfElse } from '@/workflow/workflow-steps/workflow-actions/if-else-action/components/WorkflowEditActionIfElse';
import { WorkflowEditActionFormFiller } from '@/workflow/workflow-steps/workflow-actions/form-action/components/WorkflowEditActionFormFiller';
import { WorkflowEditActionHttpRequest } from '@/workflow/workflow-steps/workflow-actions/http-request-action/components/WorkflowEditActionHttpRequest';
import { WorkflowEditActionIterator } from '@/workflow/workflow-steps/workflow-actions/iterator-action/components/WorkflowEditActionIterator';
import { WorkflowEditTriggerCronForm } from '@/workflow/workflow-trigger/components/WorkflowEditTriggerCronForm';
import { WorkflowEditTriggerDatabaseEventForm } from '@/workflow/workflow-trigger/components/WorkflowEditTriggerDatabaseEventForm';
import { WorkflowEditTriggerManual } from '@/workflow/workflow-trigger/components/WorkflowEditTriggerManual';
import { WorkflowEditTriggerWebhookForm } from '@/workflow/workflow-trigger/components/WorkflowEditTriggerWebhookForm';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';

type WorkflowRunStepNodeDetailProps = {
  stepId: string;
  trigger: WorkflowTrigger | null;
  steps: Array<WorkflowAction> | null;
  stepExecutionStatus?: WorkflowRunStepStatus;
};

export const WorkflowRunStepNodeDetail = ({
  stepId,
  trigger,
  steps,
  stepExecutionStatus,
}: WorkflowRunStepNodeDetailProps) => {
  const stepDefinition = getStepDefinitionOrThrow({
    stepId,
    trigger,
    steps,
  });

  if (!isDefined(stepDefinition) || !isDefined(stepDefinition.definition)) {
    return null;
  }

  switch (stepDefinition.type) {
    case 'trigger': {
      switch (stepDefinition.definition.type) {
        case 'DATABASE_EVENT': {
          return (
            <WorkflowEditTriggerDatabaseEventForm
              key={stepId}
              trigger={stepDefinition.definition}
              triggerOptions={{
                readonly: true,
              }}
            />
          );
        }
        case 'MANUAL': {
          return (
            <WorkflowEditTriggerManual
              key={stepId}
              trigger={stepDefinition.definition}
              triggerOptions={{
                readonly: true,
              }}
            />
          );
        }
        case 'WEBHOOK': {
          return (
            <WorkflowEditTriggerWebhookForm
              key={stepId}
              trigger={stepDefinition.definition}
              triggerOptions={{
                readonly: true,
              }}
            />
          );
        }
        case 'CRON': {
          return (
            <WorkflowEditTriggerCronForm
              key={stepId}
              trigger={stepDefinition.definition}
              triggerOptions={{
                readonly: true,
              }}
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
            <WorkflowActionServerlessFunction
              key={stepId}
              action={stepDefinition.definition}
              actionOptions={{
                readonly: true,
              }}
            />
          );
        }
        case 'SEND_EMAIL': {
          return (
            <WorkflowEditActionSendEmail
              key={stepId}
              action={stepDefinition.definition}
              actionOptions={{
                readonly: true,
              }}
            />
          );
        }
        case 'CREATE_RECORD': {
          return (
            <WorkflowEditActionCreateRecord
              key={stepId}
              action={stepDefinition.definition}
              actionOptions={{
                readonly: true,
              }}
            />
          );
        }

        case 'UPDATE_RECORD': {
          return (
            <WorkflowEditActionUpdateRecord
              key={stepId}
              action={stepDefinition.definition}
              actionOptions={{
                readonly: true,
              }}
            />
          );
        }

        case 'DELETE_RECORD': {
          return (
            <WorkflowEditActionDeleteRecord
              key={stepId}
              action={stepDefinition.definition}
              actionOptions={{
                readonly: true,
              }}
            />
          );
        }

        case 'FIND_RECORDS': {
          return (
            <WorkflowEditActionFindRecords
              key={stepId}
              action={stepDefinition.definition}
              actionOptions={{
                readonly: true,
              }}
            />
          );
        }

        case 'UPSERT_RECORD': {
          return (
            <WorkflowEditActionUpsertRecord
              key={stepId}
              action={stepDefinition.definition}
              actionOptions={{
                readonly: true,
              }}
            />
          );
        }

        case 'FORM': {
          return (
            <WorkflowEditActionFormFiller
              key={stepId}
              action={stepDefinition.definition}
              actionOptions={{
                readonly: stepExecutionStatus !== 'PENDING',
              }}
            />
          );
        }

        case 'HTTP_REQUEST': {
          return (
            <WorkflowEditActionHttpRequest
              key={stepId}
              action={stepDefinition.definition}
              actionOptions={{
                readonly: true,
              }}
            />
          );
        }
        case 'AI_AGENT': {
          return (
            <WorkflowEditActionAiAgent
              key={stepId}
              action={stepDefinition.definition}
              actionOptions={{
                readonly: true,
              }}
            />
          );
        }
        case 'FILTER': {
          return (
            <WorkflowEditActionFilter
              key={stepId}
              action={stepDefinition.definition}
              actionOptions={{
                readonly: true,
              }}
            />
          );
        }
        case 'IF_ELSE': {
          return (
            <WorkflowEditActionIfElse
              key={stepId}
              action={stepDefinition.definition}
              actionOptions={{
                readonly: true,
              }}
            />
          );
        }
        case 'ITERATOR': {
          return (
            <WorkflowEditActionIterator
              key={stepId}
              action={stepDefinition.definition}
              actionOptions={{
                readonly: true,
              }}
            />
          );
        }
        case 'EMPTY': {
          return (
            <WorkflowEditActionEmpty
              key={stepId}
              actionOptions={{
                readonly: true,
              }}
            />
          );
        }
        case 'DELAY': {
          return (
            <WorkflowEditActionDelay
              key={stepId}
              action={stepDefinition.definition}
              actionOptions={{
                readonly: true,
              }}
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
