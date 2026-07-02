import { type ObjectFieldManifest, type ObjectManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const fromFlatObjectMetadataToObjectManifest = ({
  flatObjectMetadata,
  fields,
}: {
  flatObjectMetadata: FlatObjectMetadata;
  fields: ObjectFieldManifest[];
}): ObjectManifest => {
  const labelIdentifierFieldMetadataUniversalIdentifier =
    flatObjectMetadata.labelIdentifierFieldMetadataUniversalIdentifier ??
    fields.find((field) => field.name === 'name')?.universalIdentifier;

  if (!isDefined(labelIdentifierFieldMetadataUniversalIdentifier)) {
    throw new ApplicationException(
      `Object "${flatObjectMetadata.nameSingular}" has no resolvable label identifier field`,
      ApplicationExceptionCode.INVALID_INPUT,
    );
  }

  return {
    universalIdentifier: flatObjectMetadata.universalIdentifier,
    nameSingular: flatObjectMetadata.nameSingular,
    namePlural: flatObjectMetadata.namePlural,
    labelSingular: flatObjectMetadata.labelSingular,
    labelPlural: flatObjectMetadata.labelPlural,
    ...(isDefined(flatObjectMetadata.description)
      ? { description: flatObjectMetadata.description }
      : {}),
    ...(isDefined(flatObjectMetadata.icon)
      ? { icon: flatObjectMetadata.icon }
      : {}),
    isSearchable: flatObjectMetadata.isSearchable,
    isUICreatable: flatObjectMetadata.isUICreatable,
    isUIEditable: flatObjectMetadata.isUIEditable,
    ...(flatObjectMetadata.isActive === false ? { isActive: false } : {}),
    fields,
    labelIdentifierFieldMetadataUniversalIdentifier,
  };
};
