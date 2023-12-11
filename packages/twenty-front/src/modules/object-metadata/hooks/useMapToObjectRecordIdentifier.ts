import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { ObjectRecordIdentifier } from '@/object-record/types/ObjectRecordIdentifier';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { getLogoUrlFromDomainName } from '~/utils';

export const useMapToObjectRecordIdentifier = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  return (record: any): ObjectRecordIdentifier => {
    switch (objectMetadataItem.nameSingular) {
      case CoreObjectNameSingular.Opportunity:
        return {
          id: record.id,
          name: record?.company?.name,
          avatarUrl: record.avatarUrl,
          avatarType: 'rounded',
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
        ? getLogoUrlFromDomainName(imageIdentifierFieldValue ?? '')
        : imageIdentifierFieldValue ?? null;

    return {
      id: record.id,
      name: labelIdentifierFieldValue,
      avatarUrl,
      avatarType,
    };
  };
};
