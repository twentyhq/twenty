import { isNonEmptyString } from '@sniptt/guards';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { getAppPermissionFlagKeyMappings } from 'src/database/commands/upgrade-version-command/2-53/utils/get-app-permission-flag-key-mappings.util';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';

// Whole references only: permissionFlags.APPLICATIONS_X and
// x.permissionFlags.APPLICATIONS are not flag reads and stay untouched
const PERMISSION_FLAG_REFERENCE_PATTERN =
  /(?<![\w$.])permissionFlags\.([A-Za-z_$][\w$]*)/g;

const renameAppPermissionFlagReferences = ({
  expression,
  direction,
}: {
  expression: string;
  direction: 'up' | 'down';
}): string => {
  const toKeyByFromKey = new Map(
    getAppPermissionFlagKeyMappings(direction).map(({ fromKey, toKey }) => [
      fromKey,
      toKey,
    ]),
  );

  return expression.replace(
    PERMISSION_FLAG_REFERENCE_PATTERN,
    (reference, key: string) => {
      const toKey = toKeyByFromKey.get(key);

      return isDefined(toKey) ? `permissionFlags.${toKey}` : reference;
    },
  );
};

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
}): FlatCommandMenuItem[] =>
  Object.values(flatCommandMenuItemByUniversalIdentifier)
    .filter(isDefined)
    .flatMap((commandMenuItem) => {
      const {
        applicationUniversalIdentifier,
        conditionalAvailabilityExpression,
      } = commandMenuItem;

      if (
        applicationUniversalIdentifier !==
          TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER ||
        !isNonEmptyString(conditionalAvailabilityExpression)
      ) {
        return [];
      }

      const renamedExpression = renameAppPermissionFlagReferences({
        expression: conditionalAvailabilityExpression,
        direction,
      });

      if (renamedExpression === conditionalAvailabilityExpression) {
        return [];
      }

      return [
        {
          ...commandMenuItem,
          conditionalAvailabilityExpression: renamedExpression,
          updatedAt: now,
        },
      ];
    });
