import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getBasePathToShowPage } from '@/object-metadata/utils/getBasePathToShowPage';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ObjectRecordIdentifier } from '@/object-record/types/ObjectRecordIdentifier';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
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
    case CoreObjectNameSingular.WorkspaceMember: {
      const workspaceMember = record as Partial<WorkspaceMember> & {
        id: string;
      };

      const name = workspaceMember.name
        ? `${workspaceMember.name?.firstName ?? ''} ${
            workspaceMember.name?.lastName ?? ''
          }`
        : '';

      return {
        id: workspaceMember.id,
        name,
        avatarUrl: workspaceMember.avatarUrl ?? undefined,
        avatarType: 'rounded',
      };
    }
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

  // TODO: This is a temporary solution before we seed imageIdentifierFieldMetadataId in the database
  const avatarUrl =
    (objectMetadataItem.nameSingular === CoreObjectNameSingular.Company
      ? getLogoUrlFromDomainName(record.domainName ?? '')
      : objectMetadataItem.nameSingular === CoreObjectNameSingular.Person
        ? record.avatarUrl ?? ''
        : imageIdentifierFieldValue) ?? '';

  const basePathToShowPage = getBasePathToShowPage({
    objectMetadataItem,
  });

  const isWorkspaceMemberObjectMetadata =
    objectMetadataItem.nameSingular === CoreObjectNameSingular.WorkspaceMember;

  const linkToShowPage =
    isWorkspaceMemberObjectMetadata || !record.id
      ? ''
      : `${basePathToShowPage}${record.id}`;

  return {
    id: record.id,
    name: `${labelIdentifierFieldValue}`,
    avatarUrl,
    avatarType,
    linkToShowPage,
  };
};
