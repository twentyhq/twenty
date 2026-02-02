import { isDefined } from 'twenty-shared/utils';

import { WorkflowActionType } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

type LegacyCodeStepInput = {
  serverlessFunctionId: string;
  serverlessFunctionVersion?: string;
  serverlessFunctionInput?: Record<string, unknown>;
};

type MigratedCodeStepInput = {
  logicFunctionId: string;
  logicFunctionInput?: Record<string, unknown>;
};

type WorkflowStep = {
  id: string;
  type: string;
  settings: {
    input: LegacyCodeStepInput | MigratedCodeStepInput;
    outputSchema?: unknown;
  };
};

export const needsCodeStepMigration = (
  input: LegacyCodeStepInput | MigratedCodeStepInput,
): input is LegacyCodeStepInput => {
  return (
    'serverlessFunctionId' in input && isDefined(input.serverlessFunctionId)
  );
};

export type CodeStepMigrationTarget = {
  serverlessFunctionId: string;
  serverlessFunctionVersion: string;
};

export type ServerlessToLogicFunctionMapping = (
  serverlessFunctionId: string,
  serverlessFunctionVersion: string,
) => string;

export const collectCodeStepMigrationTargets = (
  steps: unknown,
): CodeStepMigrationTarget[] => {
  if (!isDefined(steps) || !Array.isArray(steps) || steps.length === 0) {
    return [];
  }

  const typedSteps = steps as WorkflowStep[];
  const seen = new Set<string>();

  const targets: CodeStepMigrationTarget[] = [];

  for (const step of typedSteps) {
    if (step.type !== WorkflowActionType.CODE) {
      continue;
    }

    const input = step.settings.input as
      | LegacyCodeStepInput
      | MigratedCodeStepInput;

    if (!needsCodeStepMigration(input)) {
      continue;
    }

    const version = input.serverlessFunctionVersion ?? 'draft';
    const key = `${input.serverlessFunctionId}:${version}`;

    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    targets.push({
      serverlessFunctionId: input.serverlessFunctionId,
      serverlessFunctionVersion: version,
    });
  }

  return targets;
};

export const migrateWorkflowCodeStepsWithMapping = (
  steps: unknown,
  mapping: ServerlessToLogicFunctionMapping,
): { migratedSteps: WorkflowStep[]; hasChanges: boolean } => {
  if (!isDefined(steps) || !Array.isArray(steps) || steps.length === 0) {
    return { migratedSteps: [], hasChanges: false };
  }

  const typedSteps = steps as WorkflowStep[];
  let hasChanges = false;

  const migratedSteps = typedSteps.map((step) => {
    if (step.type !== WorkflowActionType.CODE) {
      return step;
    }

    const input = step.settings.input as
      | LegacyCodeStepInput
      | MigratedCodeStepInput;

    if (!needsCodeStepMigration(input)) {
      return step;
    }

    hasChanges = true;
    const version = input.serverlessFunctionVersion ?? 'draft';
    const newLogicFunctionId = mapping(input.serverlessFunctionId, version);

    return {
      ...step,
      settings: {
        ...step.settings,
        input: {
          logicFunctionId: newLogicFunctionId,
          logicFunctionInput: input.serverlessFunctionInput ?? {},
        } as MigratedCodeStepInput,
      },
    };
  });

  return { migratedSteps, hasChanges };
};
