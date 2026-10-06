import { isArray, isString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type ExportedManifest } from '@/app/types/exported-manifest.type';

export const reconcilePullBaseManifest = ({
  manifest,
  baseManifest,
  unreconciledUniversalIdentifiers,
  protectedIdentifiers,
}: {
  manifest: ExportedManifest;
  baseManifest: ExportedManifest | null;
  unreconciledUniversalIdentifiers: ReadonlySet<string>;
  protectedIdentifiers: ReadonlySet<string>;
}): ExportedManifest => {
  const getIdentifier = (value: unknown): string | undefined =>
    isPlainObject(value) && isString(value.universalIdentifier)
      ? value.universalIdentifier.toLowerCase()
      : undefined;

  const reconcileEntries = (
    currentEntries: unknown[],
    previousEntries: unknown[],
  ): unknown[] => {
    const previousEntryByIdentifier = new Map(
      previousEntries.map((entry) => [getIdentifier(entry), entry]),
    );
    const entries = currentEntries
      .filter((entry) => {
        const identifier = getIdentifier(entry);

        return (
          !isDefined(identifier) ||
          !unreconciledUniversalIdentifiers.has(identifier)
        );
      })
      .map((entry) => {
        const identifier = getIdentifier(entry);
        const previousEntry = previousEntryByIdentifier.get(identifier);

        if (
          !isDefined(identifier) ||
          !isPlainObject(entry) ||
          !isPlainObject(previousEntry)
        ) {
          return entry;
        }

        return reconcileCollections(entry, previousEntry);
      });

    const identifiers = new Set(entries.map(getIdentifier));

    const retainedEntries = previousEntries.filter((entry) => {
      const identifier = getIdentifier(entry);

      return (
        isDefined(identifier) &&
        !identifiers.has(identifier) &&
        (unreconciledUniversalIdentifiers.has(identifier) ||
          protectedIdentifiers.has(identifier))
      );
    });

    return [...entries, ...retainedEntries];
  };
  const reconcileCollections = (
    current: Record<string, unknown>,
    previous: Record<string, unknown> | null,
  ): Record<string, unknown> => {
    const reconciled = { ...current };

    for (const key of new Set([
      ...Object.keys(current),
      ...Object.keys(previous ?? {}),
    ])) {
      const currentEntries = current[key];
      const previousEntries = previous?.[key];

      if (!isArray(currentEntries) && !isArray(previousEntries)) {
        continue;
      }

      const entries = reconcileEntries(
        isArray(currentEntries) ? currentEntries : [],
        isArray(previousEntries) ? previousEntries : [],
      );

      if (isArray(currentEntries) || entries.length > 0) {
        reconciled[key] = entries;
      }
    }

    return reconciled;
  };
  const reconciled: ExportedManifest = {
    ...manifest,
    ...reconcileCollections(manifest, baseManifest),
  };

  if (
    isDefined(baseManifest) &&
    unreconciledUniversalIdentifiers.has(
      manifest.application.universalIdentifier.toLowerCase(),
    )
  ) {
    reconciled.application = baseManifest.application;
  }

  return reconciled;
};
