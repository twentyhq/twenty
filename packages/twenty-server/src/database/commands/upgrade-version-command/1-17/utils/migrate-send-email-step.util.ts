import { isDefined } from 'twenty-shared/utils';

import { WorkflowActionType } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

type LegacySendEmailInput = {
  connectedAccountId: string;
  email?: string;
  recipients?: {
    to?: string;
    cc?: string;
    bcc?: string;
  };
  subject?: string;
  body?: string;
  files?: unknown[];
};

type MigratedSendEmailInput = {
  connectedAccountId: string;
  recipients: {
    to: string;
    cc: string;
    bcc: string;
  };
  subject?: string;
  body?: string;
  files?: unknown[];
};

type WorkflowStep = {
  id: string;
  type: string;
  settings: {
    input: LegacySendEmailInput | MigratedSendEmailInput;
  };
};

export const needsMigration = (input: LegacySendEmailInput): boolean => {
  return isDefined(input.email);
};

export const migrateInput = (
  input: LegacySendEmailInput,
): MigratedSendEmailInput => {
  const { email, recipients, ...rest } = input;

  const toValue = recipients?.to || email || '';
  const ccValue = recipients?.cc ?? '';
  const bccValue = recipients?.bcc ?? '';

  return {
    ...rest,
    recipients: {
      to: toValue,
      cc: ccValue,
      bcc: bccValue,
    },
  };
};

export const migrateWorkflowSteps = (
  steps: unknown,
): { migratedSteps: WorkflowStep[]; hasChanges: boolean } => {
  if (!isDefined(steps) || !Array.isArray(steps) || steps.length === 0) {
    return { migratedSteps: [], hasChanges: false };
  }

  const typedSteps = steps as WorkflowStep[];

  let hasChanges = false;

  const migratedSteps = typedSteps.map((step) => {
    if (step.type !== WorkflowActionType.SEND_EMAIL) {
      return step;
    }

    const input = step.settings.input as LegacySendEmailInput;

    if (!needsMigration(input)) {
      return step;
    }

    hasChanges = true;

    return {
      ...step,
      settings: {
        ...step.settings,
        input: migrateInput(input),
      },
    };
  });

  return { migratedSteps, hasChanges };
};
