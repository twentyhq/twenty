import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getImageIdentifierFieldMetadataItem } from '@/object-metadata/utils/getImageIdentifierFieldMetadataItem';
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
  allowRequestsToTwentyIcons,
}: {
  objectMetadataItem: Pick<
    EnrichedObjectMetadataItem,
    | 'fields'
    | 'labelIdentifierFieldMetadataId'
    | 'nameSingular'
    | 'imageIdentifierFieldMetadataId'
  >;
  record: ObjectRecord;
  allowRequestsToTwentyIcons: boolean;
}): ObjectRecordIdentifier => {
  const labelIdentifierFieldMetadataItem =
    getLabelIdentifierFieldMetadataItem(objectMetadataItem);

  const labelIdentifierFieldValue = getLabelIdentifierFieldValue(
    record,
    labelIdentifierFieldMetadataItem,
  );

  const imageIdentifierFieldMetadata =
    getImageIdentifierFieldMetadataItem(objectMetadataItem);

  const avatarType = getAvatarType(objectMetadataItem);

  const avatarUrl = getAvatarUrl(
    objectMetadataItem.nameSingular,
    record,
    imageIdentifierFieldMetadata,
    allowRequestsToTwentyIcons,
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
