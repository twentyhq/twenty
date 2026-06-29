import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type AllUniversalWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';

export type ApplicationDeployActionSeverity =
  | 'safe'
  | 'breaking'
  | 'destructive';

type DeployActionOption = { id?: string | null };

type CurrentEnumOptionsResolver = (
  universalIdentifier: string,
) => DeployActionOption[] | null;

const hasRemovedEnumOption = (
  currentOptions: DeployActionOption[] | null,
  nextOptions: DeployActionOption[] | null,
): boolean => {
  if (!isDefined(currentOptions) || !isDefined(nextOptions)) {
    return false;
  }

  const nextOptionIds = new Set(
    nextOptions.map((option) => option.id).filter(isDefined),
  );

  return currentOptions.some(
    (option) => isDefined(option.id) && !nextOptionIds.has(option.id),
  );
};

export const classifyApplicationDeployActionSeverity = ({
  action,
  getCurrentEnumOptions,
}: {
  action: AllUniversalWorkspaceMigrationAction;
  getCurrentEnumOptions: CurrentEnumOptionsResolver;
}): ApplicationDeployActionSeverity => {
  const isFieldAction = action.metadataName === ALL_METADATA_NAME.fieldMetadata;
  const isObjectAction =
    action.metadataName === ALL_METADATA_NAME.objectMetadata;

  if (action.type === 'delete') {
    return isFieldAction || isObjectAction ? 'destructive' : 'safe';
  }

  if (action.type === 'create') {
    return 'safe';
  }

  const changedProperties = Object.keys(action.update ?? {});

  if (isFieldAction) {
    if (changedProperties.includes('options')) {
      const nextOptions =
        (action.update as { options?: DeployActionOption[] | null }).options ??
        null;
      const currentOptions = getCurrentEnumOptions(action.universalIdentifier);

      if (hasRemovedEnumOption(currentOptions, nextOptions)) {
        return 'destructive';
      }
    }

    if (
      changedProperties.includes('name') ||
      changedProperties.includes('type')
    ) {
      return 'breaking';
    }

    return 'safe';
  }

  if (isObjectAction) {
    if (
      changedProperties.includes('nameSingular') ||
      changedProperties.includes('namePlural')
    ) {
      return 'breaking';
    }

    return 'safe';
  }

  return 'safe';
};
