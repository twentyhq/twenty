import { useSetRecoilState } from 'recoil';

import { activityTargetableEntityArrayState } from '@/activities/states/activityTargetableEntityArrayState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { viewableRecordIdState } from '@/object-record/record-right-drawer/states/viewableRecordIdState';
import { viewableRecordNameSingularState } from '@/object-record/record-right-drawer/states/viewableRecordNameSingularState';
import { type WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';

import { isUpsertingActivityInDBState } from '@/activities/states/isCreatingActivityInDBState';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { type Note } from '@/activities/types/Note';
import { type NoteTarget } from '@/activities/types/NoteTarget';
import { type Task } from '@/activities/types/Task';
import { type TaskTarget } from '@/activities/types/TaskTarget';
import { useOpenRecordInCommandMenu } from '@/command-menu/hooks/useOpenRecordInCommandMenu';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
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

  const { createOneRecord: createOneActivityTarget } = useCreateOneRecord<
    TaskTarget | NoteTarget
  >({
    objectNameSingular:
      activityObjectNameSingular === CoreObjectNameSingular.Task
        ? CoreObjectNameSingular.TaskTarget
        : CoreObjectNameSingular.NoteTarget,
    shouldMatchRootQueryFilter: true,
  });

  const setActivityTargetableEntityArray = useSetRecoilState(
    activityTargetableEntityArrayState,
  );
  const setViewableRecordId = useSetRecoilState(viewableRecordIdState);
  const setViewableRecordNameSingular = useSetRecoilState(
    viewableRecordNameSingularState,
  );

  const setIsUpsertingActivityInDB = useSetRecoilState(
    isUpsertingActivityInDBState,
  );

  const { openRecordInCommandMenu } = useOpenRecordInCommandMenu();

  const { objectMetadataItems } = useObjectMetadataItems();

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
      const activityTargetObjectNameSingular =
        activityObjectNameSingular === CoreObjectNameSingular.Task
          ? CoreObjectNameSingular.TaskTarget
          : CoreObjectNameSingular.NoteTarget;

      const activityTargetObjectMetadata = objectMetadataItems.find(
        (item) => item.nameSingular === activityTargetObjectNameSingular,
      );

      const targetObjectMetadataItem = objectMetadataItems.find(
        (item) =>
          item.nameSingular === targetableObjects[0].targetObjectNameSingular,
      );

      const targetField = activityTargetObjectMetadata?.fields.find(
        (field) =>
          field.relation?.targetObjectMetadata.id ===
          targetObjectMetadataItem?.id,
      );

      const joinColumnName = targetField?.settings?.joinColumnName;

      const targetableObjectRelationIdName = isDefined(joinColumnName)
        ? joinColumnName
        : `${targetableObjects[0].targetObjectNameSingular}Id`;

      await createOneActivityTarget({
        ...(activityObjectNameSingular === CoreObjectNameSingular.Task
          ? {
              taskId: activity.id,
            }
          : {
              noteId: activity.id,
            }),
        [targetableObjectRelationIdName]: targetableObjects[0].id,
      });

      setActivityTargetableEntityArray(targetableObjects);
    } else {
      await createOneActivityTarget({
        ...(activityObjectNameSingular === CoreObjectNameSingular.Task
          ? {
              taskId: activity.id,
            }
          : {
              noteId: activity.id,
            }),
      });

      setActivityTargetableEntityArray([]);
    }

    openRecordInCommandMenu({
      recordId: activity.id,
      objectNameSingular: activityObjectNameSingular,
      isNewRecord: true,
    });

    setViewableRecordId(activity.id);

    setIsUpsertingActivityInDB(false);
  };

  return openCreateActivityDrawer;
};
