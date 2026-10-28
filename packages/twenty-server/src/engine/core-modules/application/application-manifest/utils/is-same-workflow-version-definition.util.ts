import isEqual from 'lodash.isequal';

import { type UniversalFlatWorkflowVersion } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-workflow-version.type';

type WorkflowVersionDefinition = Pick<
  UniversalFlatWorkflowVersion,
  'triggers' | 'steps'
>;

// Compared as stored in jsonb, where undefined properties are dropped
const toJsonValue = ({ triggers, steps }: WorkflowVersionDefinition): unknown =>
  JSON.parse(
    JSON.stringify({ triggers: triggers ?? null, steps: steps ?? null }),
  );

export const isSameWorkflowVersionDefinition = (
  left: WorkflowVersionDefinition,
  right: WorkflowVersionDefinition,
): boolean => isEqual(toJsonValue(left), toJsonValue(right));
