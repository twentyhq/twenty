import { activityTargetableEntityArrayState } from '@/activities/states/activityTargetableEntityArrayState';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { viewableRecordIdState } from '@/object-record/record-side-panel/states/viewableRecordIdState';
import { viewableRecordNameSingularState } from '@/object-record/record-side-panel/states/viewableRecordNameSingularState';
import { type WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';

import { isUpsertingActivityInDBState } from '@/activities/states/isCreatingActivityInDBState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { type Note } from '@/activities/types/Note';
import { type Task } from '@/activities/types/Task';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useCreateManyRecords } from '@/object-record/hooks/useCreateManyRecords';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { findTargetFieldInfo } from '@/object-record/record-field/ui/utils/junction/findTargetFieldInfo';
import { useActivityTargetJunctionConfig } from '@/activities/hooks/useActivityTargetJunctionConfig';
import { isDefined } from 'twenty-shared/utils';

export const useOpenCreateActivityDrawer = ({
  activityObjectNameSingular,
}: {
  activityObjectNameSingular:
    | CoreObjectNameSingular.Note
    | CoreObjectNameSingular.Task;
}) => {
  const { createOneRecord: createOneActivity } = useCreateOneRecord<
    (Task | Note) & { position: 'first' | 'last' }
  >({
    objectNameSingular: activityObjectNameSingular,
  });

  const { objectMetadataItems } = useObjectMetadataItems();

  const activityTargetJunctionConfig = useActivityTargetJunctionConfig({
    activityObjectNameSingular,
  });

  const { createManyRecords: createActivityTargets } = useCreateManyRecords({
    objectNameSingular:
      activityTargetJunctionConfig?.junctionObjectMetadata.nameSingular ??
      activityObjectNameSingular,
    shouldMatchRootQueryFilter: true,
  });

  const setActivityTargetableEntityArray = useSetAtomState(
    activityTargetableEntityArrayState,
  );
  const setViewableRecordId = useSetAtomState(viewableRecordIdState);
  const setViewableRecordNameSingular = useSetAtomState(
    viewableRecordNameSingularState,
  );

  const setIsUpsertingActivityInDB = useSetAtomState(
    isUpsertingActivityInDBState,
  );

  const { openRecordInSidePanel } = useOpenRecordInSidePanel();

  const openCreateActivityDrawer = async ({
    targetableObjects,
    customAssignee,
  }: {
    targetableObjects: ActivityTargetableObject[];
    customAssignee?: WorkspaceMember;
  }) => {
    setViewableRecordId(null);
    setViewableRecordNameSingular(activityObjectNameSingular);

    const activity = await createOneActivity({
      ...(activityObjectNameSingular === CoreObjectNameSingular.Task
        ? {
            assigneeId: customAssignee?.id,
          }
        : {}),
      position: 'last',
    });

    if (targetableObjects.length > 0) {
      if (!isDefined(activityTargetJunctionConfig)) {
        throw new Error('Activity target junction metadata is invalid');
      }

      const { junctionObjectMetadata, activityJoinColumnName } =
        activityTargetJunctionConfig;

      const recordsToCreate = targetableObjects.map((targetableObject) => {
        const targetObjectMetadata = objectMetadataItems.find(
          (item) =>
            item.nameSingular === targetableObject.targetObjectNameSingular,
        );
        const targetFieldInfo = findTargetFieldInfo(
          junctionObjectMetadata.fields,
          targetObjectMetadata?.id ?? '',
          objectMetadataItems,
        );

        if (!isDefined(targetFieldInfo?.joinColumnName)) {
          throw new Error(
            `Activity target junction does not support ${targetableObject.targetObjectNameSingular}`,
          );
        }

        return {
          [activityJoinColumnName]: activity.id,
          [targetFieldInfo.joinColumnName]: targetableObject.id,
        };
      });

      await createActivityTargets({ recordsToCreate, upsert: true });
    }

    setActivityTargetableEntityArray(targetableObjects);

    openRecordInSidePanel({
      recordId: activity.id,
      objectNameSingular: activityObjectNameSingular,
      isNewRecord: true,
    });

    setViewableRecordId(activity.id);

    setIsUpsertingActivityInDB(false);
  };

  return openCreateActivityDrawer;
};
