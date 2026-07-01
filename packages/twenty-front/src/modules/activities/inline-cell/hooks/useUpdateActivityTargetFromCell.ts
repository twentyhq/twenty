import { type ActivityTargetWithTargetRecord } from '@/activities/types/ActivityTargetObject';
import { type NoteTarget } from '@/activities/types/NoteTarget';
import { type TaskTarget } from '@/activities/types/TaskTarget';
import { getActivityTargetFieldNameForObject } from '@/activities/utils/getActivityTargetFieldNameForObject';
import { getJoinObjectNameSingular } from '@/activities/utils/getJoinObjectNameSingular';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { searchRecordStoreFamilyState } from '@/object-record/record-picker/multiple-record-picker/states/searchRecordStoreComponentFamilyState';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { useCallback, useRef } from 'react';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

type UpdateActivityTargetFromCellProps = {
  recordPickerInstanceId: string;
  morphItem: RecordPickerPickableMorphItem;
  activityTargetWithTargetRecords: ActivityTargetWithTargetRecord[];
};

// TODO: deprecate this hook once we implement one-to-many relation through
export const useUpdateActivityTargetFromCell = ({
  activityObjectNameSingular,
  activityId,
}: {
  activityObjectNameSingular:
    | CoreObjectNameSingular.Note
    | CoreObjectNameSingular.Task;
  activityId: string;
}) => {
  const joinObjectNameSingular = getJoinObjectNameSingular(
    activityObjectNameSingular,
  );

  const { createOneRecord: createOneActivityTarget } = useCreateOneRecord<
    NoteTarget | TaskTarget
  >({
    objectNameSingular:
      joinObjectNameSingular === ''
        ? activityObjectNameSingular
        : joinObjectNameSingular,
    shouldMatchRootQueryFilter: true,
  });

  const { deleteOneRecord: deleteOneActivityTarget } = useDeleteOneRecord({
    objectNameSingular:
      joinObjectNameSingular === ''
        ? activityObjectNameSingular
        : joinObjectNameSingular,
  });
  const store = useStore();
  const setRecordStore = useSetAtomFamilyState(
    recordStoreFamilyState,
    activityId,
  );
  const pendingActivityTargetCreationKeysRef = useRef(new Set<string>());

  const updateActivityTargetFromCell = useCallback(
    async ({
      morphItem,
      activityTargetWithTargetRecords,
    }: UpdateActivityTargetFromCellProps) => {
      const targetObjectName =
        activityObjectNameSingular === CoreObjectNameSingular.Task
          ? 'task'
          : 'note';

      const objectMetadataItems = store.get(objectMetadataItemsSelector.atom);

      const pickedObjectMetadataItem = objectMetadataItems.find(
        (objectMetadataItem) =>
          objectMetadataItem.id === morphItem.objectMetadataId,
      );

      if (!isDefined(pickedObjectMetadataItem)) {
        throw new Error('Could not find object metadata item');
      }

      const targetFieldName = getActivityTargetFieldNameForObject({
        activityObjectNameSingular,
        targetObjectMetadataId: morphItem.objectMetadataId,
        objectMetadataItems,
      });

      if (!isDefined(targetFieldName)) {
        throw new Error(
          `Could not find field on activity target for object ${pickedObjectMetadataItem.nameSingular}`,
        );
      }

      let activityTargetsAfterUpdate: (TaskTarget | NoteTarget)[] = [];

      const existingActivityTarget = activityTargetWithTargetRecords.find(
        (activityTarget) =>
          activityTarget.targetObject.id === morphItem.recordId,
      );

      const activityTargetsInStore =
        ((store.get(recordStoreFamilyState.atomFamily(activityId))?.[
          `${targetObjectName}Targets`
        ] as (TaskTarget | NoteTarget)[]) ?? []);

      const hasActivityTargetInStore = activityTargetsInStore.some(
        (activityTarget) => {
          const activityTargetAsRecord = activityTarget as Record<
            string,
            unknown
          >;

          const targetId = activityTargetAsRecord[`${targetFieldName}Id`];

          if (typeof targetId === 'string') {
            return targetId === morphItem.recordId;
          }

          const targetRecord = activityTargetAsRecord[targetFieldName];

          if (typeof targetRecord !== 'object' || !isDefined(targetRecord)) {
            return false;
          }

          if (!('id' in targetRecord)) {
            return false;
          }

          return targetRecord.id === morphItem.recordId;
        },
      );

      if (isDefined(existingActivityTarget)) {
        activityTargetsAfterUpdate = activityTargetWithTargetRecords.flatMap(
          (activityTarget) => {
            if (
              activityTarget.targetObject.id === morphItem.recordId &&
              !morphItem.isSelected
            ) {
              return [];
            }

            return [activityTarget.activityTarget];
          },
        );

        if (!morphItem.isSelected) {
          await deleteOneActivityTarget(
            existingActivityTarget.activityTarget.id,
          );
        }
      } else {
        if (morphItem.isSelected && hasActivityTargetInStore) {
          return;
        }
        const searchRecord = store.get(
          searchRecordStoreFamilyState.atomFamily(morphItem.recordId),
        );

        if (!isDefined(searchRecord) || !isDefined(searchRecord?.record)) {
          return;
        }

        if (!morphItem.isSelected) {
          return;
        }

        const activityTargetCreationKey = `${activityId}-${morphItem.objectMetadataId}-${morphItem.recordId}`;

        if (
          pendingActivityTargetCreationKeysRef.current.has(
            activityTargetCreationKey,
          )
        ) {
          return;
        }

        const targetRecord = searchRecord.record;

        const activityTarget: NoteTarget | TaskTarget =
          activityObjectNameSingular === CoreObjectNameSingular.Task
            ? {
                id: v4(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                __typename: 'TaskTarget',
                taskId: activityId,
                task: {
                  id: activityId,
                  __typename: 'Task',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
                [targetFieldName]: targetRecord,
              }
            : {
                id: v4(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                __typename: 'NoteTarget',
                noteId: activityId,
                note: {
                  id: activityId,
                  __typename: 'Note',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
                [targetFieldName]: targetRecord,
              };

        activityTargetsAfterUpdate = [
          ...activityTargetWithTargetRecords.map((activityTarget) => {
            return activityTarget.activityTarget;
          }),
          activityTarget,
        ];

        const activityTargetInput: Partial<NoteTarget | TaskTarget> = {
          ...activityTarget,
          [targetObjectName]: undefined,
          [targetFieldName]: undefined,
          [`${targetFieldName}Id`]: morphItem.recordId,
        };

        pendingActivityTargetCreationKeysRef.current.add(
          activityTargetCreationKey,
        );

        try {
          await createOneActivityTarget(activityTargetInput);
        } finally {
          pendingActivityTargetCreationKeysRef.current.delete(
            activityTargetCreationKey,
          );
        }
      }

      setRecordStore((currentActivity) => {
        if (!isDefined(currentActivity)) {
          return null;
        }

        return {
          ...currentActivity,
          [`${targetObjectName}Targets`]: activityTargetsAfterUpdate,
        };
      });
    },
    [
      store,
      activityId,
      activityObjectNameSingular,
      createOneActivityTarget,
      deleteOneActivityTarget,
      setRecordStore,
    ],
  );

  return { updateActivityTargetFromCell };
};
