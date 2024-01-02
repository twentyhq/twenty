import { useApolloClient } from '@apollo/client';
import { useRecoilCallback } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ViewField } from '@/views/types/ViewField';
import { getViewScopedStatesFromSnapshot } from '@/views/utils/getViewScopedStatesFromSnapshot';
import { getViewScopedStateValuesFromSnapshot } from '@/views/utils/getViewScopedStateValuesFromSnapshot';

export const useViewFields = (viewScopeId: string) => {
  const { updateOneRecordMutation, createOneRecordMutation } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.ViewField,
    });

  const { modifyRecordFromCache } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.View,
  });

  const apolloClient = useApolloClient();

  const persistViewFields = useRecoilCallback(
    ({ snapshot, set }) =>
      async (viewFieldsToPersist: ViewField[], viewId?: string) => {
        const {
          viewObjectMetadataId,
          currentViewId,
          savedViewFieldsByKey,
          onViewFieldsChange,
          views,
        } = getViewScopedStateValuesFromSnapshot({
          snapshot,
          viewScopeId,
          viewId,
        });

        const {
          isPersistingViewState,
          currentViewFieldsState,
          savedViewFieldsState,
        } = getViewScopedStatesFromSnapshot({
          snapshot,
          viewScopeId,
          viewId,
        });

        const viewIdToPersist = viewId ?? currentViewId;

        if (!currentViewId || !savedViewFieldsByKey || !viewObjectMetadataId) {
          return;
        }

        const _createViewFields = (viewFieldsToCreate: ViewField[]) => {
          if (!viewFieldsToCreate.length) {
            return;
          }

          return Promise.all(
            viewFieldsToCreate.map((viewField) =>
              apolloClient.mutate({
                mutation: createOneRecordMutation,
                variables: {
                  input: {
                    fieldMetadataId: viewField.fieldMetadataId,
                    viewId: viewIdToPersist,
                    isVisible: viewField.isVisible,
                    size: viewField.size,
                    position: viewField.position,
                  },
                },
              }),
            ),
          );
        };

        const _updateViewFields = (viewFieldsToUpdate: ViewField[]) => {
          if (!viewFieldsToUpdate.length) {
            return;
          }

          return Promise.all(
            viewFieldsToUpdate.map((viewField) =>
              apolloClient.mutate({
                mutation: updateOneRecordMutation,
                variables: {
                  idToUpdate: viewField.id,
                  input: {
                    isVisible: viewField.isVisible,
                    size: viewField.size,
                    position: viewField.position,
                  },
                },
              }),
            ),
          );
        };

        const viewFieldsToCreate = viewFieldsToPersist.filter(
          (viewField) => !savedViewFieldsByKey[viewField.fieldMetadataId],
        );

        const viewFieldsToUpdate = viewFieldsToPersist.filter(
          (viewFieldToPersit) =>
            savedViewFieldsByKey[viewFieldToPersit.fieldMetadataId] &&
            (savedViewFieldsByKey[viewFieldToPersit.fieldMetadataId].size !==
              viewFieldToPersit.size ||
              savedViewFieldsByKey[viewFieldToPersit.fieldMetadataId]
                .position !== viewFieldToPersit.position ||
              savedViewFieldsByKey[viewFieldToPersit.fieldMetadataId]
                .isVisible !== viewFieldToPersit.isVisible),
        );

        set(isPersistingViewState, true);

        await _createViewFields(viewFieldsToCreate);

        await _updateViewFields(viewFieldsToUpdate);

        set(isPersistingViewState, false);
        set(currentViewFieldsState, viewFieldsToPersist);
        set(savedViewFieldsState, viewFieldsToPersist);

        const existingView = views.find((view) => view.id === viewIdToPersist);

        if (!existingView) {
          return;
        }

        modifyRecordFromCache(viewIdToPersist ?? '', {
          viewFields: () => ({
            edges: viewFieldsToPersist.map((viewField) => ({
              node: viewField,
              cursor: '',
            })),
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: '',
              endCursor: '',
            },
          }),
        });

        onViewFieldsChange?.(viewFieldsToPersist);
      },
    [
      viewScopeId,
      modifyRecordFromCache,
      apolloClient,
      createOneRecordMutation,
      updateOneRecordMutation,
    ],
  );

  return { persistViewFields };
};
