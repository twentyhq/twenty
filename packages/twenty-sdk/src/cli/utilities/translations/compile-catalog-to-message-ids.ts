import { generateMessageId } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';

import { flattenLocaleCatalog } from '@/cli/utilities/translations/locale-catalog-format';

// Authoring files are keyed readable (context groups + plain messages) for
// translators; runtime lookups are by message id, so every consumer compiles
// through here.
export const compileCatalogToMessageIds = ({
  catalog,
  onCollision,
}: {
  // Parsed straight from on-disk JSON, so values are only claimed strings.
  catalog: Record<string, unknown>;
  onCollision?: (args: {
    messageId: string;
    keptKey: string;
    droppedKey: string;
  }) => void;
}): Record<string, string> => {
  const compiled: Record<string, string> = {};
  const keyByMessageId = new Map<string, string>();

  for (const { message, context, translation } of flattenLocaleCatalog(
    catalog,
  )) {
    if (translation.length === 0) {
      continue;
    }

    const key = isDefined(context) ? `${context} ${message}` : message;
    const messageId = generateMessageId(message, context);
    const collidingKey = keyByMessageId.get(messageId);

    if (isDefined(collidingKey) && collidingKey !== key) {
      onCollision?.({ messageId, keptKey: key, droppedKey: collidingKey });
    }

    keyByMessageId.set(messageId, key);
    compiled[messageId] = translation;
  }

  return compiled;
};
