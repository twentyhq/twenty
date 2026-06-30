import { useStore } from 'jotai';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { useLoadRecordIndexStates } from '@/object-record/record-index/hooks/useLoadRecordIndexStates';
import { recordIndexViewTypeState } from '@/object-record/record-index/states/recordIndexViewTypeState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';
import { viewFromViewIdFamilySelector } from '@/views/states/selectors/viewFromViewIdFamilySelector';
import { type GraphQLView } from '@/views/types/GraphQLView';
import { type View } from '@/views/types/View';
import { type ViewGroup } from '@/views/types/ViewGroup';
import { type ViewType } from '@/views/types/ViewType';
import { convertUpdateViewInputToGql } from '@/views/utils/convertUpdateViewInputToGql';
import { useCallback, useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { useMutation } from '@apollo/client/react';
import { UpdateViewDocument } from '~/generated-metadata/graphql';

export const useUpdateCurrentView = () => {
  const { canPersistChanges } = useCanPersistViewChanges();
  const currentViewIdCallbackState = useAtomComponentStateCallbackState(
    contextStoreCurrentViewIdComponentState,
  );
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();
  const { loadRecordIndexStates } = useLoadRecordIndexStates();
  const setRecordIndexViewType = useSetAtomState(recordIndexViewTypeState);

  const store = useStore();

  const [updateOneView] = useMutation(UpdateViewDocument);

  const getViewGroupsToCreateAtViewUpdate = useMemo(() => {
    return ({
      existingView,
      newMainGroupByFieldMetadataId,
    }: {
      existingView: View;
      newMainGroupByFieldMetadataId?: string | null;
    }) => {
      if (newMainGroupByFieldMetadataId === undefined) {
        return {};
      }

      let viewGroupsToCreate: ViewGroup[] = [];

      if (
        newMainGroupByFieldMetadataId !==
        existingView.mainGroupByFieldMetadataId
      ) {
        if (newMainGroupByFieldMetadataId !== null) {
          viewGroupsToCreate =
            objectMetadataItem.fields
              ?.find(
                (field: { id: string }) =>
                  field.id === newMainGroupByFieldMetadataId,
              )
              ?.options?.map(
                (option: { value: string }, index: number) =>
                  ({
                    id: v4(),
                    fieldValue: option.value,
                    isVisible: true,
                    position: index,
                  }) satisfies ViewGroup,
              ) ?? [];

          if (
            objectMetadataItem.fields.find(
              (field: { id: string }) =>
                field.id === newMainGroupByFieldMetadataId,
            )?.isNullable === true
          ) {
            viewGroupsToCreate.push({
              id: v4(),
              fieldValue: '',
              position: viewGroupsToCreate.length,
              isVisible: true,
            } satisfies ViewGroup);
          }
        }
      }

      return { viewGroupsToCreate };
    };
  }, [objectMetadataItem.fields]);

  const updateCurrentView = useCallback(
    async (view: Partial<GraphQLView> & { type?: ViewType }) => {
      if (!canPersistChanges) {
        return;
      }

      const currentViewId = store.get(currentViewIdCallbackState);

      const currentView = store.get(
        viewFromViewIdFamilySelector.selectorFamily({
          viewId: currentViewId ?? '',
        }),
      );

      if (!isDefined(currentView)) {
        return;
      }

      if (isDefined(currentViewId)) {
        const input = convertUpdateViewInputToGql(view);

        await updateOneView({
          variables: {
            id: currentViewId,
            input,
          },
        });

        if (
          input.mainGroupByFieldMetadataId !== undefined &&
          currentView.mainGroupByFieldMetadataId !==
            input.mainGroupByFieldMetadataId
        ) {
          const { viewGroupsToCreate } = getViewGroupsToCreateAtViewUpdate({
            existingView: currentView,
            newMainGroupByFieldMetadataId: input.mainGroupByFieldMetadataId,
          });

          loadRecordIndexStates(
            {
              ...currentView,
              mainGroupByFieldMetadataId: input.mainGroupByFieldMetadataId,
              viewGroups: viewGroupsToCreate ?? [],
            },
            objectMetadataItem,
          );
        }

        if (isDefined(view.type)) {
          setRecordIndexViewType(view.type);
        }
      }
    },
    [
      canPersistChanges,
      currentViewIdCallbackState,
      getViewGroupsToCreateAtViewUpdate,
      loadRecordIndexStates,
      objectMetadataItem,
      setRecordIndexViewType,
      store,
      updateOneView,
    ],
  );

  return {
    updateCurrentView,
  };
};
