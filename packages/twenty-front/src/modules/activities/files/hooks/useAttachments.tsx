import { type Attachment } from '@/activities/files/types/Attachment';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { getActivityTargetObjectFieldIdName } from '@/activities/utils/getActivityTargetObjectFieldIdName';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useAttachments = (targetableObject: ActivityTargetableObject) => {
  const isAttachmentMigrated = useIsFeatureEnabled(
    FeatureFlagKey.IS_ATTACHMENT_MIGRATED,
  );

  const targetableObjectFieldIdName = getActivityTargetObjectFieldIdName({
    nameSingular: targetableObject.targetObjectNameSingular,
    isMorphRelation: isAttachmentMigrated,
  });

  const { records: attachments, loading } = useFindManyRecords<Attachment>({
    objectNameSingular: CoreObjectNameSingular.Attachment,
    filter: {
      [targetableObjectFieldIdName]: {
        eq: targetableObject.id,
      },
    },
    orderBy: [
      {
        createdAt: 'DescNullsFirst',
      },
    ],
  });

  return {
    attachments,
    loading,
  };
};
