import { CoreObjectNameSingular } from 'twenty-shared/types';

export const AUTOMATION_OBJECT_NAMES_SINGULAR = [
  CoreObjectNameSingular.Workflow,
  CoreObjectNameSingular.WorkflowRun,
] as const satisfies readonly CoreObjectNameSingular[];
