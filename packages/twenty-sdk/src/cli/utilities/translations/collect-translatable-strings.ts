import { type Manifest } from 'twenty-shared/application';

const TRANSLATABLE_KEYS_BY_MANIFEST_KEY: Record<string, readonly string[]> = {
  objects: ['labelSingular', 'labelPlural', 'description'],
  fields: ['label', 'description'],
  views: ['name'],
  pageLayoutTabs: ['title'],
  commandMenuItems: ['label', 'shortLabel'],
  navigationMenuItems: ['name'],
};

export const collectTranslatableStrings = (manifest: Manifest): string[] => {
  const strings = new Set<string>();

  const addString = (value: unknown) => {
    if (typeof value === 'string' && value.length > 0) {
      strings.add(value);
    }
  };

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
        addString((entity as Record<string, unknown>)[fieldKey]);
      }
    }
  }

  // Tab and widget titles live nested under pageLayouts[].tabs[], not in the
  // flat pageLayoutTabs array, so walk the tree to reach them.
  for (const pageLayout of manifest.pageLayouts ?? []) {
    for (const tab of pageLayout.tabs ?? []) {
      addString(tab.title);

      for (const widget of tab.widgets ?? []) {
        addString(widget.title);
      }
    }
  }

  return [...strings].sort();
};
