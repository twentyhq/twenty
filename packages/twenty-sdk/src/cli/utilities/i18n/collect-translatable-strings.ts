import { type Manifest } from 'twenty-shared/application';

const TRANSLATABLE_KEYS_BY_MANIFEST_KEY: Record<string, readonly string[]> = {
  objects: ['labelSingular', 'labelPlural', 'description'],
  fields: ['label', 'description'],
  views: ['name'],
  pageLayoutTabs: ['title'],
  commandMenuItems: ['label', 'shortLabel'],
  navigationMenuItems: ['label'],
};

export const collectTranslatableStrings = (manifest: Manifest): string[] => {
  const strings = new Set<string>();

  for (const [manifestKey, fieldKeys] of Object.entries(
    TRANSLATABLE_KEYS_BY_MANIFEST_KEY,
  )) {
    const entities = (manifest as unknown as Record<string, unknown>)[
      manifestKey
    ];

    if (!Array.isArray(entities)) {
      continue;
    }

    for (const entity of entities) {
      if (entity === null || typeof entity !== 'object') {
        continue;
      }

      for (const fieldKey of fieldKeys) {
        const value = (entity as Record<string, unknown>)[fieldKey];

        if (typeof value === 'string' && value.length > 0) {
          strings.add(value);
        }
      }
    }
  }

  return [...strings].sort();
};
