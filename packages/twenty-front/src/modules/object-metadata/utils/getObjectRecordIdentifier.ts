import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { ObjectRecordIdentifier } from '@/object-record/types/ObjectRecordIdentifier';
import { FieldMetadataType } from '~/generated/graphql';
import { getLogoUrlFromDomainName } from '~/utils';

export const getObjectRecordIdentifier = ({
  objectMetadataItem,
  record,
}: {
  objectMetadataItem: ObjectMetadataItem;
  record: any;
}): ObjectRecordIdentifier => {
  const basePathToShowPage = `/object/${objectMetadataItem.nameSingular}/`;
  const linkToShowPage = `${basePathToShowPage}${record.id}`;

  if (objectMetadataItem.nameSingular === CoreObjectNameSingular.Opportunity) {
    return {
      id: record.id,
      name: record?.company?.name,
      avatarUrl: record.avatarUrl,
      avatarType: 'rounded',
      linkToShowPage,
    };
  }

  const labelIdentifierFieldMetadata = objectMetadataItem.fields.find(
    (field) =>
      field.id === objectMetadataItem.labelIdentifierFieldMetadataId ||
      field.name === 'name',
  );

  let labelIdentifierFieldValue = '';

  switch (labelIdentifierFieldMetadata?.type) {
    case FieldMetadataType.FullName: {
      labelIdentifierFieldValue = `${record.name?.firstName ?? ''} ${
        record.name?.lastName ?? ''
      }`;
      break;
    }
    default:
      labelIdentifierFieldValue = labelIdentifierFieldMetadata
        ? record[labelIdentifierFieldMetadata.name]
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

  return {
    id: record.id,
    name: labelIdentifierFieldValue,
    avatarUrl,
    avatarType,
    linkToShowPage,
  };
};
