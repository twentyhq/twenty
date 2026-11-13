import { isDefined, isFieldMetadataOptionActive } from 'twenty-shared/utils';

import { type FlatFieldMetadataOptionMaps } from 'src/engine/metadata-modules/flat-field-metadata-option/types/flat-field-metadata-option-maps.type';
import { resolveEffectiveFlatEntity } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity.util';

export const findInactiveFieldMetadataOptionValues = ({
  fieldMetadataUniversalIdentifier,
  flatFieldMetadataOptionMaps,
}: {
  fieldMetadataUniversalIdentifier: string | undefined;
  flatFieldMetadataOptionMaps: Pick<
    FlatFieldMetadataOptionMaps,
    'byUniversalIdentifier'
  >;
}): ReadonlySet<string> =>
  new Set(
    Object.values(flatFieldMetadataOptionMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter(
        (flatFieldMetadataOption) =>
          flatFieldMetadataOption.fieldMetadataUniversalIdentifier ===
          fieldMetadataUniversalIdentifier,
      )
      .map((flatFieldMetadataOption) =>
        resolveEffectiveFlatEntity({
          metadataName: 'fieldMetadataOption',
          flatEntity: flatFieldMetadataOption,
        }),
      )
      .filter(
        (effectiveOption) => !isFieldMetadataOptionActive(effectiveOption),
      )
      .map(({ value }) => value),
  );
