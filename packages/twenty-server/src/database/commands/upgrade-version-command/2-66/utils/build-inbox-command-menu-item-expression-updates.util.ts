import { isDefined } from 'twenty-shared/utils';

import { LEGACY_AGENT_CHAT_OBJECT_NAMES_BY_UNIVERSAL_IDENTIFIER } from 'src/database/commands/upgrade-version-command/2-42/constants/legacy-agent-chat-object-names-by-universal-identifier.constant';
import { INBOX_OBJECT_NAMES_BY_UNIVERSAL_IDENTIFIER } from 'src/database/commands/upgrade-version-command/2-66/constants/inbox-object-names-by-universal-identifier.constant';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';

const INBOX_OBJECT_NAME_REPLACEMENTS = Object.entries(
  LEGACY_AGENT_CHAT_OBJECT_NAMES_BY_UNIVERSAL_IDENTIFIER,
).flatMap(([universalIdentifier, legacyObjectNames]) => {
  const inboxObjectNames =
    INBOX_OBJECT_NAMES_BY_UNIVERSAL_IDENTIFIER[universalIdentifier];

  if (!isDefined(legacyObjectNames) || !isDefined(inboxObjectNames)) {
    return [];
  }

  return [
    {
      legacyNamePattern: new RegExp(
        `\\b${legacyObjectNames.nameSingular}\\b`,
        'g',
      ),
      inboxName: inboxObjectNames.nameSingular,
    },
    {
      legacyNamePattern: new RegExp(
        `\\b${legacyObjectNames.namePlural}\\b`,
        'g',
      ),
      inboxName: inboxObjectNames.namePlural,
    },
  ];
});

const replaceLegacyAgentChatObjectNames = (
  expression: string | null,
): string | null =>
  isDefined(expression)
    ? INBOX_OBJECT_NAME_REPLACEMENTS.reduce(
        (rewrittenExpression, { legacyNamePattern, inboxName }) =>
          rewrittenExpression.replace(legacyNamePattern, inboxName),
        expression,
      )
    : expression;

export const buildInboxCommandMenuItemExpressionUpdates = ({
  flatCommandMenuItemMaps,
  now,
}: {
  flatCommandMenuItemMaps: FlatEntityMaps<FlatCommandMenuItem>;
  now: string;
}): FlatCommandMenuItem[] =>
  Object.values(flatCommandMenuItemMaps.byUniversalIdentifier)
    .filter(isDefined)
    .flatMap((flatCommandMenuItem) => {
      const conditionalAvailabilityExpression =
        replaceLegacyAgentChatObjectNames(
          flatCommandMenuItem.conditionalAvailabilityExpression,
        );
      const conditionalPinnedExpression = replaceLegacyAgentChatObjectNames(
        flatCommandMenuItem.conditionalPinnedExpression,
      );

      if (
        conditionalAvailabilityExpression ===
          flatCommandMenuItem.conditionalAvailabilityExpression &&
        conditionalPinnedExpression ===
          flatCommandMenuItem.conditionalPinnedExpression
      ) {
        return [];
      }

      return [
        {
          ...flatCommandMenuItem,
          conditionalAvailabilityExpression,
          conditionalPinnedExpression,
          updatedAt: now,
        },
      ];
    });
