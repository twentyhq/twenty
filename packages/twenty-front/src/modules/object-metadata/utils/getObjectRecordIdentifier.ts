import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getBasePathToShowPage } from '@/object-metadata/utils/getBasePathToShowPage';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ObjectRecordIdentifier } from '@/object-record/types/ObjectRecordIdentifier';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { getLogoUrlFromDomainName } from '~/utils';
import { isDefined } from '~/utils/isDefined';

export const getLabelIdentifierFieldValue = (
  record: ObjectRecord,
  labelIdentifierFieldMetadataItem: FieldMetadataItem | undefined,
  objectNameSingular: string,
) => {
  if (
    objectNameSingular === CoreObjectNameSingular.WorkspaceMember ||
    labelIdentifierFieldMetadataItem?.type === FieldMetadataType.FullName
  ) {
    return `${record.name?.firstName ?? ''} ${record.name?.lastName ?? ''}`;
  }

  if (isDefined(labelIdentifierFieldMetadataItem?.name)) {
    return record[labelIdentifierFieldMetadataItem.name] as string | number;
  }

  return '';
};

const getImageIdentifierFieldValue = (
  record: ObjectRecord,
  imageIdentifierFieldMetadataItem: FieldMetadataItem | undefined,
) => {
  if (isDefined(imageIdentifierFieldMetadataItem?.name)) {
    return record[imageIdentifierFieldMetadataItem.name] as string;
  }

  return null;
};

export const getAvatarType = (objectNameSingular: string) => {
  if (objectNameSingular === CoreObjectNameSingular.WorkspaceMember) {
    return 'rounded';
  }

  if (objectNameSingular === CoreObjectNameSingular.Company) {
    return 'squared';
  }

  return 'rounded';
};

export const getAvatarUrl = (
  objectNameSingular: string,
  record: ObjectRecord,
  imageIdentifierFieldMetadataItem: FieldMetadataItem | undefined,
) => {
  if (objectNameSingular === CoreObjectNameSingular.WorkspaceMember) {
    return record.avatarUrl ?? undefined;
  }

  if (objectNameSingular === CoreObjectNameSingular.Company) {
    return getLogoUrlFromDomainName(record.domainName ?? '');
  }

  if (objectNameSingular === CoreObjectNameSingular.Person) {
    return record.avatarUrl ?? '';
  }

  const imageIdentifierFieldValue = getImageIdentifierFieldValue(
    record,
    imageIdentifierFieldMetadataItem,
  );

  if (isDefined(imageIdentifierFieldValue)) {
    return imageIdentifierFieldValue;
  }

  return '';
};

export const getLinkToShowPage = (
  objectNameSingular: string,
  record: ObjectRecord,
) => {
  const basePathToShowPage = getBasePathToShowPage({
    objectNameSingular,
  });

  const isWorkspaceMemberObjectMetadata =
    objectNameSingular === CoreObjectNameSingular.WorkspaceMember;

  const linkToShowPage =
    isWorkspaceMemberObjectMetadata || !record.id
      ? ''
      : `${basePathToShowPage}${record.id}`;

  return linkToShowPage;
};

export const getObjectRecordIdentifier = ({
  objectMetadataItem,
  record,
}: {
  objectMetadataItem: ObjectMetadataItem;
  record: ObjectRecord;
}): ObjectRecordIdentifier => {
  const labelIdentifierFieldMetadataItem =
    getLabelIdentifierFieldMetadataItem(objectMetadataItem);

  const labelIdentifierFieldValue = getLabelIdentifierFieldValue(
    record,
    labelIdentifierFieldMetadataItem,
    objectMetadataItem.nameSingular,
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
