import {
  resolveManifestReferenceUniversalIdentifier,
  type SyncableEntityOptions,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

type DeprecatedReferences<TReferenceKey extends string> = Partial<
  Record<TReferenceKey, SyncableEntityOptions>
>;

type FlatReferences<TReferenceKey extends string> = Partial<
  Record<`${TReferenceKey}UniversalIdentifier`, string>
>;

// Servers before 2.63 only read the deprecated { universalIdentifier } form, so the built manifest carries both.
export const withBothManifestReferenceSpellings = <
  TReferenceKey extends string,
  TEntity extends DeprecatedReferences<TReferenceKey> &
    FlatReferences<TReferenceKey>,
>({
  entity,
  referenceKeys,
}: {
  entity: TEntity;
  referenceKeys: readonly TReferenceKey[];
}): TEntity =>
  referenceKeys.reduce<TEntity>((entityWithBothSpellings, referenceKey) => {
    const flatReferences: FlatReferences<TReferenceKey> =
      entityWithBothSpellings;
    const deprecatedReferences: DeprecatedReferences<TReferenceKey> =
      entityWithBothSpellings;
    const universalIdentifier = resolveManifestReferenceUniversalIdentifier({
      universalIdentifier: flatReferences[`${referenceKey}UniversalIdentifier`],
      deprecatedReference: deprecatedReferences[referenceKey],
    });

    return isDefined(universalIdentifier)
      ? {
          ...entityWithBothSpellings,
          [`${referenceKey}UniversalIdentifier`]: universalIdentifier,
          [referenceKey]: { universalIdentifier },
        }
      : entityWithBothSpellings;
  }, entity);
