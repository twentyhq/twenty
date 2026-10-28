import { isNonEmptyString } from '@sniptt/guards';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type AppPermissionFlagKeyRenameDirection } from 'src/database/commands/upgrade-version-command/2-53/types/app-permission-flag-key-rename-direction.type';
import { getAppPermissionFlagKeyMappings } from 'src/database/commands/upgrade-version-command/2-53/utils/get-app-permission-flag-key-mappings.util';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';

// Whole references only: permissionFlags.APPLICATIONS_X and
// x.permissionFlags.APPLICATIONS are not flag reads and stay untouched
const PERMISSION_FLAG_REFERENCE_PATTERN =
  /(?<![\w$.])permissionFlags\.([A-Za-z_$][\w$]*)/g;

const renameAppPermissionFlagReferences = ({
  expression,
  toKeyByFromKey,
}: {
  expression: string | null;
  toKeyByFromKey: Map<string, string>;
}): string | null =>
  isNonEmptyString(expression)
    ? expression.replace(
        PERMISSION_FLAG_REFERENCE_PATTERN,
        (reference, key: string) => {
          const toKey = toKeyByFromKey.get(key);

          return isDefined(toKey) ? `permissionFlags.${toKey}` : reference;
        },
      )
    : expression;

export const buildAppPermissionFlagExpressionUpdates = ({
  flatCommandMenuItemByUniversalIdentifier,
  workspaceCustomApplicationUniversalIdentifier,
  now,
  direction,
}: {
  flatCommandMenuItemByUniversalIdentifier: Record<
    string,
    FlatCommandMenuItem | undefined
  >;
  workspaceCustomApplicationUniversalIdentifier: string;
  now: string;
  direction: AppPermissionFlagKeyRenameDirection;
}): {
  standardCommandMenuItemsToUpdate: FlatCommandMenuItem[];
  customCommandMenuItemsToUpdate: FlatCommandMenuItem[];
  skippedCommandMenuItemCount: number;
} => {
  const toKeyByFromKey = new Map(
    getAppPermissionFlagKeyMappings(direction).map(({ fromKey, toKey }) => [
      fromKey,
      toKey,
    ]),
  );

  const standardCommandMenuItemsToUpdate: FlatCommandMenuItem[] = [];
  const customCommandMenuItemsToUpdate: FlatCommandMenuItem[] = [];
  let skippedCommandMenuItemCount = 0;

  for (const commandMenuItem of Object.values(
    flatCommandMenuItemByUniversalIdentifier,
  ).filter(isDefined)) {
    const conditionalAvailabilityExpression = renameAppPermissionFlagReferences(
      {
        expression: commandMenuItem.conditionalAvailabilityExpression,
        toKeyByFromKey,
      },
    );
    const conditionalPinnedExpression = renameAppPermissionFlagReferences({
      expression: commandMenuItem.conditionalPinnedExpression,
      toKeyByFromKey,
    });

    if (
      conditionalAvailabilityExpression ===
        commandMenuItem.conditionalAvailabilityExpression &&
      conditionalPinnedExpression ===
        commandMenuItem.conditionalPinnedExpression
    ) {
      continue;
    }

    const updatedCommandMenuItem = {
      ...commandMenuItem,
      conditionalAvailabilityExpression,
      conditionalPinnedExpression,
      updatedAt: now,
    };

    if (
      commandMenuItem.applicationUniversalIdentifier ===
      TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER
    ) {
      standardCommandMenuItemsToUpdate.push(updatedCommandMenuItem);
    } else if (
      commandMenuItem.applicationUniversalIdentifier ===
      workspaceCustomApplicationUniversalIdentifier
    ) {
      customCommandMenuItemsToUpdate.push(updatedCommandMenuItem);
    } else {
      // The owning application's next manifest sync would revert a rewrite
      skippedCommandMenuItemCount++;
    }
  }

  return {
    standardCommandMenuItemsToUpdate,
    customCommandMenuItemsToUpdate,
    skippedCommandMenuItemCount,
  };
};
