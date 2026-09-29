import { isArray, isString } from '@sniptt/guards';
import { type Manifest } from 'twenty-shared/application';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

export const reconcilePullBaseManifest = ({
  manifest,
  baseManifest,
  unreconciledUniversalIdentifiers,
  protectedIdentifiers,
}: {
  manifest: Manifest;
  baseManifest: Manifest | null;
  unreconciledUniversalIdentifiers: ReadonlySet<string>;
  protectedIdentifiers: ReadonlySet<string>;
}): Manifest => {
  const getIdentifier = (value: unknown): string | undefined =>
    isPlainObject(value) && isString(value.universalIdentifier)
      ? value.universalIdentifier.toLowerCase()
      : undefined;

  const keys = new Set([
    ...Object.keys(manifest),
    ...Object.keys(baseManifest ?? {}),
  ]);

  return Object.fromEntries(
    [...keys].map((key) => {
      const previousValue: unknown = baseManifest?.[key as keyof Manifest];
      const currentValue: unknown = manifest[key as keyof Manifest];
      const value =
        !isDefined(currentValue) && isArray(previousValue) ? [] : currentValue;

      if (key === 'application') {
        return [
          key,
          unreconciledUniversalIdentifiers.has(
            manifest.application.universalIdentifier.toLowerCase(),
          ) && isDefined(previousValue)
            ? previousValue
            : value,
        ];
      }

      if (!isArray(value)) {
        return [key, value];
      }

      const reconciledEntries = value.filter((entry) => {
        const identifier = getIdentifier(entry);

        return (
          !isDefined(identifier) ||
          !unreconciledUniversalIdentifiers.has(identifier)
        );
      });
      const reconciledIdentifiers = new Set(
        reconciledEntries.map(getIdentifier),
      );
      const retainedEntries = (
        isArray(previousValue) ? previousValue : []
      ).filter((entry) => {
        const identifier = getIdentifier(entry);

        return (
          isDefined(identifier) &&
          !reconciledIdentifiers.has(identifier) &&
          (unreconciledUniversalIdentifiers.has(identifier) ||
            protectedIdentifiers.has(identifier))
        );
      });

      return [key, [...reconciledEntries, ...retainedEntries]];
    }),
  ) as Manifest;
};
