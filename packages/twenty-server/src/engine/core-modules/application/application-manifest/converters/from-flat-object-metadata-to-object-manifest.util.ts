import {
  type ObjectFieldManifest,
  type ObjectManifest,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

export const fromFlatObjectMetadataToObjectManifest = ({
  flatObjectMetadata,
  fields,
  labelIdentifierFieldMetadataUniversalIdentifier,
}: {
  flatObjectMetadata: UniversalFlatObjectMetadata;
  fields: ObjectFieldManifest[];
  labelIdentifierFieldMetadataUniversalIdentifier: string;
}): ObjectManifest => ({
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
  color: flatObjectMetadata.color,
  isLabelSyncedWithName: flatObjectMetadata.isLabelSyncedWithName,
  isSearchable: flatObjectMetadata.isSearchable,
  isUICreatable: flatObjectMetadata.isUICreatable,
  isUIEditable: flatObjectMetadata.isUIEditable,
  writability: flatObjectMetadata.writability,
  openRecordIn: flatObjectMetadata.openRecordIn,
  labelIdentifierFieldMetadataUniversalIdentifier,
  imageIdentifierFieldMetadataUniversalIdentifier:
    flatObjectMetadata.imageIdentifierFieldMetadataUniversalIdentifier,
  fields,
});
