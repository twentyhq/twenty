import { generateMessageId } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';

import { parseTranslationCatalogKey } from '@/sdk/front-component/translations/message';

// Authoring files are keyed readable (context + message) for translators;
// runtime lookups are by message id, so every consumer compiles through here.
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

  for (const [key, translation] of Object.entries(catalog)) {
    if (typeof translation !== 'string' || translation.length === 0) {
      continue;
    }

    const { message, context } = parseTranslationCatalogKey(key);
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
