import { type LogicFunctionPrebuiltStateFields } from 'src/engine/metadata-modules/logic-function/utils/is-logic-function-ready-for-prebuilt-install.util';
import { type WorkspaceMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration.type';

const LOGIC_FUNCTION_PREBUILT_STATE_KEYS: (keyof LogicFunctionPrebuiltStateFields)[] =
  ['executionMode', 'isBuildUpToDate', 'checksum'];

export const findLogicFunctionUniversalIdentifiersToWarmUp = (
  workspaceMigration: WorkspaceMigration,
): string[] =>
  workspaceMigration.actions.flatMap((action) => {
    if (action.metadataName !== 'logicFunction') {
      return [];
    }

    if (action.type === 'create') {
      return [action.flatEntity.universalIdentifier];
    }

    if (
      action.type === 'update' &&
      LOGIC_FUNCTION_PREBUILT_STATE_KEYS.some((key) => key in action.update)
    ) {
      return [action.universalIdentifier];
    }

    return [];
  });
