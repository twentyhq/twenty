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

  const reconciled: ExportedManifest = { ...manifest };

  for (const key of new Set([
    ...Object.keys(manifest),
    ...Object.keys(baseManifest ?? {}),
  ])) {
    const currentEntries = manifest[key];

    const previousEntries = baseManifest?.[key];

    if (!isArray(currentEntries) && !isArray(previousEntries)) {
      continue;
    }

    const entries: unknown[] = (
      isArray(currentEntries) ? currentEntries : []
    ).filter((entry) => {
      const identifier = getIdentifier(entry);

      return (
        !isDefined(identifier) ||
        !unreconciledUniversalIdentifiers.has(identifier)
      );
    });

    const identifiers = new Set(entries.map(getIdentifier));

    const retainedEntries = (
      isArray(previousEntries) ? previousEntries : []
    ).filter((entry) => {
      const identifier = getIdentifier(entry);

      return (
        isDefined(identifier) &&
        !identifiers.has(identifier) &&
        (unreconciledUniversalIdentifiers.has(identifier) ||
          protectedIdentifiers.has(identifier))
      );
    });

    if (isArray(currentEntries) || retainedEntries.length > 0) {
      reconciled[key] = [...entries, ...retainedEntries];
    }
  }

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
