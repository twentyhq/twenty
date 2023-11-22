import { useApolloClient } from '@apollo/client';
import { useRecoilCallback } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { ViewField } from '@/views/types/ViewField';
import { getViewScopedStatesFromSnapshot } from '@/views/utils/getViewScopedStatesFromSnapshot';
import { getViewScopedStateValuesFromSnapshot } from '@/views/utils/getViewScopedStateValuesFromSnapshot';

export const useViewFields = (viewScopeId: string) => {
  const { updateOneMutation, createOneMutation } = useObjectMetadataItem({
    objectNameSingular: 'viewField',
  });

  const apolloClient = useApolloClient();

  const persistViewFields = useRecoilCallback(
    ({ snapshot, set }) =>
      async (viewFieldsToPersist: ViewField[], viewId?: string) => {
        const { viewObjectMetadataId, currentViewId, savedViewFieldsByKey } =
          getViewScopedStateValuesFromSnapshot({
            snapshot,
            viewScopeId,
            viewId,
          });

        const { isPersistingViewState } = getViewScopedStatesFromSnapshot({
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
                mutation: createOneMutation,
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
                mutation: updateOneMutation,
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
      },
    [apolloClient, createOneMutation, updateOneMutation, viewScopeId],
  );

  return { persistViewFields };
};
