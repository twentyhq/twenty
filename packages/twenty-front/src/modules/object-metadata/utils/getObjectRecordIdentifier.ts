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
  if (objectMetadataItem.nameSingular === CoreObjectNameSingular.Opportunity) {
    return {
      id: record.id,
      name: record?.company?.name ?? record.name,
      avatarUrl: record.avatarUrl,
      avatarType: 'rounded',
      linkToShowPage: `/opportunities/${record.id}`,
    };
  }

  const labelIdentifierFieldMetadataItem =
    getLabelIdentifierFieldMetadataItem(objectMetadataItem);

  const labelIdentifierFieldValue =
    labelIdentifierFieldMetadataItem?.type === FieldMetadataType.FullName
      ? `${record.name?.firstName ?? ''} ${record.name?.lastName ?? ''}`
      : labelIdentifierFieldMetadataItem?.name
        ? (record[labelIdentifierFieldMetadataItem.name] as string | number)
        : '';

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
    (objectMetadataItem.nameSingular === CoreObjectNameSingular.Company
      ? getLogoUrlFromDomainName(record['domainName'] ?? '')
      : imageIdentifierFieldValue) ?? '';

  const basePathToShowPage = getBasePathToShowPage({
    objectMetadataItem,
  });

  const linkToShowPage = `${basePathToShowPage}${record.id}`;

  return {
    id: record.id,
    name: `${labelIdentifierFieldValue}`,
    avatarUrl,
    avatarType,
    linkToShowPage,
  };
};
