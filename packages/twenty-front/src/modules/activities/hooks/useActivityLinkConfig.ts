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

export type ActivityLinkConfig = {
  relatedCompany: { id: string; name: string };
  junctionObjectNameSingular: string;
  activityJoinColumnName: string;
  targetJoinColumnName: string;
};

export const useActivityLinkConfig = ({
  targetRecord,
  activityObjectNameSingular,
}: {
  targetRecord: ActivityTargetableObject;
  activityObjectNameSingular:
    | CoreObjectNameSingular.MessageThread
    | CoreObjectNameSingular.CalendarEvent;
}): ActivityLinkConfig | null => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: targetRecord.targetObjectNameSingular,
  });
  const { objectMetadataItem: activityMetadataItem } = useObjectMetadataItem({
    objectNameSingular: activityObjectNameSingular,
  });
  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const companyRelationField = objectMetadataItem.fields.find(
    (field) =>
      field.isActive &&
      field.relation?.type === RelationType.MANY_TO_ONE &&
      field.relation.targetObjectMetadata.nameSingular ===
        CoreObjectNameSingular.Company,
  );

  const junctionConfig = getObjectMorphJunctionConfig({
    objectMetadata: activityMetadataItem,
    objectMetadataItems,
  });

  const targetJoinColumnName = isDefined(junctionConfig)
    ? findTargetFieldInfo(
        junctionConfig.targetFields,
        objectMetadataItem.id,
        objectMetadataItems,
      )?.joinColumnName
    : undefined;

  const canLinkActivities =
    isDefined(junctionConfig) &&
    getObjectPermissionsForObject(
      objectPermissionsByObjectMetadataId,
      junctionConfig.junctionObjectMetadata.id,
    ).canUpdateObjectRecords;

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
      !isDefined(targetJoinColumnName) ||
      !canLinkActivities,
  });

  const relatedCompany: ActivityLinkConfig['relatedCompany'] | undefined =
    record?.[companyRelationFieldName];

  if (
    !isDefined(relatedCompany) ||
    !isDefined(junctionConfig) ||
    !isDefined(targetJoinColumnName) ||
    !canLinkActivities
  ) {
    return null;
  }

  return {
    relatedCompany,
    junctionObjectNameSingular:
      junctionConfig.junctionObjectMetadata.nameSingular,
    activityJoinColumnName: junctionConfig.sourceJoinColumnName,
    targetJoinColumnName,
  };
};
