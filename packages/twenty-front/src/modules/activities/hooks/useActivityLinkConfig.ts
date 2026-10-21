import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { useObjectMorphJunctionConfig } from '@/object-record/record-field/ui/hooks/useObjectMorphJunctionConfig';
import { findTargetFieldInfo } from '@/object-record/record-field/ui/utils/junction/findTargetFieldInfo';
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
  targetRecord: Pick<
    ActivityTargetableObject,
    'id' | 'targetObjectNameSingular'
  >;
  activityObjectNameSingular:
    | CoreObjectNameSingular.MessageThread
    | CoreObjectNameSingular.CalendarEvent;
}): ActivityLinkConfig | null => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: targetRecord.targetObjectNameSingular,
  });
  const { objectMetadataItems } = useObjectMetadataItems();
  const junctionConfig = useObjectMorphJunctionConfig({
    objectNameSingular: activityObjectNameSingular,
  });
  const { canUpdateObjectRecords: canLinkActivities } =
    useObjectPermissionsForObject(
      junctionConfig?.junctionObjectMetadata.id ?? '',
    );

  const companyRelationField = objectMetadataItem.fields.find(
    (field) =>
      field.isActive &&
      field.relation?.type === RelationType.MANY_TO_ONE &&
      field.relation.targetObjectMetadata.nameSingular ===
        CoreObjectNameSingular.Company,
  );

  const targetJoinColumnName = isDefined(junctionConfig)
    ? findTargetFieldInfo(
        junctionConfig.targetFields,
        objectMetadataItem.id,
        objectMetadataItems,
      )?.joinColumnName
    : undefined;

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
