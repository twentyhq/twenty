import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { usePerformViewGroupAPIPersist } from '@/views/hooks/internal/usePerformViewGroupAPIPersist';
import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import {
  type CreateViewGroupInput,
  type UpdateManyViewGroupsMutationVariables,
} from '~/generated-metadata/graphql';

export const usePersistRelationRecordGroups = () => {
  const store = useStore();

  const { currentView } = useGetCurrentViewOnly();
  const { canPersistChanges } = useCanPersistViewChanges();
  const { performViewGroupAPIUpdate, performViewGroupAPICreate } =
    usePerformViewGroupAPIPersist();

  const persistRelationRecordGroups = useCallback(
    async (recordGroups: RecordGroupDefinition[]) => {
      if (!canPersistChanges) {
        return;
      }

      const viewId = currentView?.id;

      if (!isDefined(viewId)) {
        return;
      }

      const createInputs: CreateViewGroupInput[] = [];
      const updateInputs: UpdateManyViewGroupsMutationVariables['inputs'] = [];
      const createdViewGroupIdByRecordGroupId = new Map<string, string>();

      for (const recordGroup of recordGroups) {
        const fieldValue = recordGroup.value ?? '';
        const isVisible = recordGroup.isVisible ?? true;

        if (isDefined(recordGroup.viewGroupId)) {
          updateInputs.push({
            id: recordGroup.viewGroupId,
            update: {
              position: recordGroup.position,
              isVisible,
              fieldValue,
            },
          });
          continue;
        }

        const newViewGroupId = v4();

        createInputs.push({
          id: newViewGroupId,
          viewId,
          fieldValue,
          position: recordGroup.position,
          isVisible,
        });
        createdViewGroupIdByRecordGroupId.set(recordGroup.id, newViewGroupId);
      }

      await performViewGroupAPICreate({ inputs: createInputs });
      await performViewGroupAPIUpdate({ inputs: updateInputs });

      for (const [
        recordGroupId,
        viewGroupId,
      ] of createdViewGroupIdByRecordGroupId) {
        const existingRecordGroup = store.get(
          recordGroupDefinitionFamilyState.atomFamily(recordGroupId),
        );

        if (isDefined(existingRecordGroup)) {
          store.set(
            recordGroupDefinitionFamilyState.atomFamily(recordGroupId),
            {
              ...existingRecordGroup,
              viewGroupId,
            },
          );
        }
      }
    },
    [
      canPersistChanges,
      currentView?.id,
      performViewGroupAPICreate,
      performViewGroupAPIUpdate,
      store,
    ],
  );

  return {
    persistRelationRecordGroups,
  };
};
