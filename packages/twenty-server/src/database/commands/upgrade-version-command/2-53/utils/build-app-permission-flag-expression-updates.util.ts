import { isNonEmptyString } from '@sniptt/guards';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { getAppPermissionFlagKeyMappings } from 'src/database/commands/upgrade-version-command/2-53/utils/get-app-permission-flag-key-mappings.util';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';

// Whole flag reads only, not permissionFlags.APPLICATIONS_X or x.permissionFlags.APPLICATIONS
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
  now,
  direction,
}: {
  flatCommandMenuItemByUniversalIdentifier: Record<
    string,
    FlatCommandMenuItem | undefined
  >;
  now: string;
  direction: 'up' | 'down';
}): {
  standardCommandMenuItemsToUpdate: FlatCommandMenuItem[];
  nonStandardCommandMenuItemsToUpdate: FlatCommandMenuItem[];
} => {
  const toKeyByFromKey = new Map(
    getAppPermissionFlagKeyMappings(direction).map(({ fromKey, toKey }) => [
      fromKey,
      toKey,
    ]),
  );

  const standardCommandMenuItemsToUpdate: FlatCommandMenuItem[] = [];
  const nonStandardCommandMenuItemsToUpdate: FlatCommandMenuItem[] = [];

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
    } else {
      nonStandardCommandMenuItemsToUpdate.push(updatedCommandMenuItem);
    }
  }

  return {
    standardCommandMenuItemsToUpdate,
    nonStandardCommandMenuItemsToUpdate,
  };
};
