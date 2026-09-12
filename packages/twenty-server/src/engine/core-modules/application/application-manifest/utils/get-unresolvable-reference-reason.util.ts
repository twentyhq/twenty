import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { MANIFEST_ENTITY_REGISTRY } from 'src/engine/core-modules/application/application-manifest/utils/find-manifest-entity-descriptor-by-universal-identifier.util';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';

const withArticle = (label: string) =>
  `${/^[aeiou]/.test(label) ? 'an' : 'a'} ${label}`;

export const getUnresolvableReferenceReason = ({
  metadataName,
  referenceMetadataName,
  referenceUniversalIdentifier,
  applicationAllFlatEntityMaps,
  allFlatEntityMaps,
  resolvableReferenceUniversalIdentifiers,
}: {
  metadataName: AllMetadataName;
  referenceMetadataName: AllMetadataName;
  referenceUniversalIdentifier: string | null;
  applicationAllFlatEntityMaps: AllFlatEntityMaps;
  allFlatEntityMaps: AllFlatEntityMaps;
  resolvableReferenceUniversalIdentifiers: ReadonlySet<string>;
}): string | undefined => {
  if (!isDefined(referenceUniversalIdentifier)) {
    return undefined;
  }

  const label = MANIFEST_ENTITY_REGISTRY[metadataName].entityKind;
  const referenceLabel =
    MANIFEST_ENTITY_REGISTRY[referenceMetadataName].entityKind;
  const flatEntityMapsKey = getMetadataFlatEntityMapsKey(referenceMetadataName);

  if (
    isDefined(
      applicationAllFlatEntityMaps[flatEntityMapsKey].byUniversalIdentifier[
        referenceUniversalIdentifier
      ],
    ) &&
    !resolvableReferenceUniversalIdentifiers.has(referenceUniversalIdentifier)
  ) {
    return `${label} on an unsupported ${referenceLabel}`;
  }

  if (
    !isDefined(
      allFlatEntityMaps[flatEntityMapsKey].byUniversalIdentifier[
        referenceUniversalIdentifier
      ],
    )
  ) {
    return `${label} on ${withArticle(referenceLabel)} that does not exist`;
  }

  return undefined;
};
