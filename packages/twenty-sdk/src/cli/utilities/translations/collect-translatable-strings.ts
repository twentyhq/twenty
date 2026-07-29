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

      // Field labels live inside `objects[].fields[]`, not at the top-level
      // `fields[]` array, so walk one level deeper here. Without this, the
      // translation catalog only contains object-level labels and four generic
      // top-level fields; every field defined via `defineObject` is missed.
      // See #23192.
      if (manifestKey === 'objects') {
        const nestedFields = (entity as Record<string, unknown>)['fields'];

        if (Array.isArray(nestedFields)) {
          for (const nestedField of nestedFields) {
            if (nestedField === null || typeof nestedField !== 'object') {
              continue;
            }

            for (const nestedFieldKey of ['label', 'description']) {
              addString(
                (nestedField as Record<string, unknown>)[nestedFieldKey],
              );
            }
          }
        }

        const nestedIndex = (entity as Record<string, unknown>)['indexes'];

        if (Array.isArray(nestedIndex)) {
          for (const index of nestedIndex) {
            if (index === null || typeof index !== 'object') {
              continue;
            }
            for (const indexKey of ['name', 'description']) {
              addString((index as Record<string, unknown>)[indexKey]);
            }
          }
        }
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
