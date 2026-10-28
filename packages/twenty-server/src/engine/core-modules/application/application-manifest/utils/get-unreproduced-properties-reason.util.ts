import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { compareByCodePoint } from 'src/engine/core-modules/application/application-manifest/utils/compare-by-code-point.util';
import { MANIFEST_ENTITY_REGISTRY } from 'src/engine/core-modules/application/application-manifest/utils/find-manifest-entity-descriptor-by-universal-identifier.util';
import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { compareTwoFlatEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/compare-two-universal-flat-entity.util';

// Compares as the sync does, so an exported definition can never produce an update on apply
export const getUnreproducedPropertiesReason = <
  TMetadataName extends AllMetadataName,
>({
  metadataName,
  flatEntity,
  reproducedUniversalFlatEntity,
}: {
  metadataName: TMetadataName;
  flatEntity: MetadataUniversalFlatEntity<TMetadataName>;
  reproducedUniversalFlatEntity: MetadataUniversalFlatEntity<TMetadataName>;
}): string | undefined => {
  const comparison = compareTwoFlatEntity({
    fromUniversalFlatEntity: flatEntity,
    toUniversalFlatEntity: reproducedUniversalFlatEntity,
    metadataName,
  });

  if (!isDefined(comparison)) {
    return undefined;
  }

  const properties = [
    ...Object.keys(comparison.update),
    ...comparison.nonUpdatablePropertyDivergences,
  ].sort(compareByCodePoint);

  return `${MANIFEST_ENTITY_REGISTRY[metadataName].entityKind} with values a definition cannot express: ${properties.join(', ')}`;
};
