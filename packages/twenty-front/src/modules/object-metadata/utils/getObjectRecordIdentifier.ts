import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getBasePathToShowPage } from '@/object-metadata/utils/getBasePathToShowPage';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ObjectRecordIdentifier } from '@/object-record/types/ObjectRecordIdentifier';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { getLogoUrlFromDomainName } from '~/utils';

export const getObjectRecordIdentifier = ({
  objectMetadataItem,
  record,
}: {
  objectMetadataItem: ObjectMetadataItem;
  record: ObjectRecord;
}): ObjectRecordIdentifier => {
  switch (objectMetadataItem.nameSingular) {
    case CoreObjectNameSingular.Opportunity:
      return {
        id: record.id,
        name: record?.company?.name,
        avatarUrl: record.avatarUrl,
        avatarType: 'rounded',
      };
  }

  const labelIdentifierFieldMetadataItem =
    getLabelIdentifierFieldMetadataItem(objectMetadataItem);

  let labelIdentifierFieldValue = '';

  switch (labelIdentifierFieldMetadataItem?.type) {
    case FieldMetadataType.FullName: {
      labelIdentifierFieldValue = `${record.name?.firstName ?? ''} ${
        record.name?.lastName ?? ''
      }`;
      break;
    }
    default:
      labelIdentifierFieldValue = labelIdentifierFieldMetadataItem
        ? record[labelIdentifierFieldMetadataItem.name]
        : '';
  }

  const imageIdentifierFieldMetadata = objectMetadataItem.fields.find(
    (field) => field.id === objectMetadataItem.imageIdentifierFieldMetadataId,
  );

  const imageIdentifierFieldValue = imageIdentifierFieldMetadata
    ? (record[imageIdentifierFieldMetadata.name] as string)
    : null;

  const avatarType =
    objectMetadataItem.nameSingular === CoreObjectNameSingular.Company
      ? 'squared'
      : 'rounded';

  const avatarUrl =
    objectMetadataItem.nameSingular === CoreObjectNameSingular.Company
      ? getLogoUrlFromDomainName(record['domainName'] ?? '')
      : imageIdentifierFieldValue ?? null;

  const basePathToShowPage = getBasePathToShowPage({
    objectMetadataItem,
  });

  const linkToEntity = `${basePathToShowPage}${record.id}`;

  return {
    id: record.id,
    name: labelIdentifierFieldValue,
    avatarUrl,
    avatarType,
    linkToEntity,
  };
};
