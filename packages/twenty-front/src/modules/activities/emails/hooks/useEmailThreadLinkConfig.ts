import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { findTargetFieldInfo } from '@/object-record/record-field/ui/utils/junction/findTargetFieldInfo';
import { getObjectMorphJunctionConfig } from '@/object-record/record-field/ui/utils/junction/getObjectMorphJunctionConfig';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { RelationType } from '~/generated-metadata/graphql';

export type EmailThreadLinkConfig = {
  relatedCompany: { id: string; name: string };
  messageThreadTargetJoinColumnName: string;
};

export const useEmailThreadLinkConfig = (
  targetRecord: ActivityTargetableObject,
): EmailThreadLinkConfig | null => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: targetRecord.targetObjectNameSingular,
  });
  const { objectMetadataItem: messageThreadMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.MessageThread,
    });
  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const companyRelationField = objectMetadataItem.fields.find(
    (field) =>
      field.isActive === true &&
      field.relation?.type === RelationType.MANY_TO_ONE &&
      field.relation.targetObjectMetadata.nameSingular ===
        CoreObjectNameSingular.Company,
  );

  const messageThreadJunctionConfig = getObjectMorphJunctionConfig({
    objectMetadata: messageThreadMetadataItem,
    objectMetadataItems,
  });

  const messageThreadTargetJoinColumnName = isDefined(
    messageThreadJunctionConfig,
  )
    ? findTargetFieldInfo(
        messageThreadJunctionConfig.targetFields,
        objectMetadataItem.id,
        objectMetadataItems,
      )?.joinColumnName
    : undefined;

  const canLinkEmailThreads =
    isDefined(messageThreadJunctionConfig) &&
    getObjectPermissionsForObject(
      objectPermissionsByObjectMetadataId,
      messageThreadJunctionConfig.junctionObjectMetadata.id,
    ).canUpdateObjectRecords === true;

  const companyRelationFieldName = companyRelationField?.name ?? '';

  const { record } = useFindOneRecord({
    objectNameSingular: targetRecord.targetObjectNameSingular,
    objectRecordId: targetRecord.id,
    recordGqlFields: {
      id: true,
      [companyRelationFieldName]: { id: true, name: true },
    },
    skip:
      !isDefined(companyRelationField) ||
      !isDefined(messageThreadTargetJoinColumnName) ||
      !canLinkEmailThreads,
  });

  const relatedCompany = record?.[companyRelationFieldName] as
    | { id: string; name: string }
    | null
    | undefined;

  if (
    !isDefined(relatedCompany) ||
    !isDefined(messageThreadTargetJoinColumnName) ||
    !canLinkEmailThreads
  ) {
    return null;
  }

  return { relatedCompany, messageThreadTargetJoinColumnName };
};
