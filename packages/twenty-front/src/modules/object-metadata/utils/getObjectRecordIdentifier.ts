import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type ObjectRecordIdentifier } from '@/object-record/types/ObjectRecordIdentifier';

import { getAvatarType } from './getAvatarType';
import { getAvatarUrl } from './getAvatarUrl';
import { getLabelIdentifierFieldValue } from './getLabelIdentifierFieldValue';
import { getLinkToShowPage } from './getLinkToShowPage';

export const getObjectRecordIdentifier = ({
  objectMetadataItem,
  record,
}: {
  objectMetadataItem: Pick<
    ObjectMetadataItem,
    | 'fields'
    | 'labelIdentifierFieldMetadataId'
    | 'nameSingular'
    | 'imageIdentifierFieldMetadataId'
  >;
  record: ObjectRecord;
}): ObjectRecordIdentifier => {
  const labelIdentifierFieldMetadataItem =
    getLabelIdentifierFieldMetadataItem(objectMetadataItem);

  const labelIdentifierFieldValue = getLabelIdentifierFieldValue(
    record,
    labelIdentifierFieldMetadataItem,
  );

  const imageIdentifierFieldMetadata = objectMetadataItem.fields.find(
    (field) => field.id === objectMetadataItem.imageIdentifierFieldMetadataId,
  );

  const avatarType = getAvatarType(objectMetadataItem.nameSingular);

  // TODO: This is a temporary solution before we seed imageIdentifierFieldMetadataId in the database
  const avatarUrl = getAvatarUrl(
    objectMetadataItem.nameSingular,
    record,
    imageIdentifierFieldMetadata,
  );

  const linkToShowPage = getLinkToShowPage(
    objectMetadataItem.nameSingular,
    record,
  );

  return {
    id: record.id,
    name: `${labelIdentifierFieldValue}`,
    avatarUrl,
    avatarType,
    linkToShowPage,
  };
};
