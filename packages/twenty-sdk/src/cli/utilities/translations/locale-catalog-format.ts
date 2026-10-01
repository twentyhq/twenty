import { isDefined } from 'twenty-shared/utils';

// Hand-authored: messages at the top level, contextual ones grouped under their context (string = translation, object = group)
export type LocaleCatalogEntry = {
  message: string;
  context?: string;
  translation: string;
};

export const flattenLocaleCatalog = (
  raw: Record<string, unknown>,
): LocaleCatalogEntry[] => {
  const entries: LocaleCatalogEntry[] = [];

  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === 'string') {
      entries.push({ message: key, translation: value });
      continue;
    }

    if (isDefined(value) && typeof value === 'object') {
      for (const [message, translation] of Object.entries(value)) {
        if (typeof translation === 'string') {
          entries.push({ message, context: key, translation });
        }
      }
    }
  }

  return entries;
};

export const buildLocaleCatalog = (
  entries: LocaleCatalogEntry[],
): Record<string, string | Record<string, string>> => {
  const catalog: Record<string, string | Record<string, string>> = {};
  const sorted = [...entries].sort(
    (a, b) =>
      (a.context ?? '').localeCompare(b.context ?? '') ||
      a.message.localeCompare(b.message),
  );

  for (const { message, context, translation } of sorted) {
    if (!isDefined(context)) {
      catalog[message] = translation;
      continue;
    }

    const group = catalog[context];

    if (typeof group === 'object' && isDefined(group)) {
      group[message] = translation;
    } else {
      catalog[context] = { [message]: translation };
    }
  }

  return catalog;
};
