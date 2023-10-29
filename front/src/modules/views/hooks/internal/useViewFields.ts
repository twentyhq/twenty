import { useApolloClient } from '@apollo/client';
import { useRecoilCallback } from 'recoil';

import { useFindOneMetadataObject } from '@/metadata/hooks/useFindOneMetadataObject';
import { currentViewIdScopedState } from '@/views/states/currentViewIdScopedState';
import { savedViewFieldByKeyScopedFamilySelector } from '@/views/states/selectors/savedViewFieldByKeyScopedFamilySelector';
import { viewObjectIdScopeState } from '@/views/states/viewObjectIdScopeState';
import { ViewField } from '@/views/types/ViewField';

export const useViewFields = (viewScopeId: string) => {
  const { updateOneMutation, createOneMutation, findManyQuery } =
    useFindOneMetadataObject({
      objectNameSingular: 'viewFieldV2',
    });
  const apolloClient = useApolloClient();

  const persistViewFields = useRecoilCallback(
    ({ snapshot }) =>
      async (viewFieldsToPersist: ViewField[], viewId?: string) => {
        const currentViewId = snapshot
          .getLoadable(currentViewIdScopedState({ scopeId: viewScopeId }))
          .getValue();

        const viewObjectId = snapshot
          .getLoadable(viewObjectIdScopeState({ scopeId: viewScopeId }))
          .getValue();

        const savedViewFieldsByKey = snapshot
          .getLoadable(
            savedViewFieldByKeyScopedFamilySelector({
              viewScopeId: viewScopeId,
              viewId: viewId ?? currentViewId,
            }),
          )
          .getValue();

        if (!currentViewId || !savedViewFieldsByKey || !viewObjectId) {
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
                    fieldId: viewField.fieldId,
                    viewId: viewId,
                    isVisible: viewField.isVisible,
                    size: viewField.size,
                    position: viewField.position,
                  },
                },
                refetchQueries: [findManyQuery],
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
          (viewField) => !savedViewFieldsByKey[viewField.fieldId],
        );
        await _createViewFields(viewFieldsToCreate);

        const viewFieldsToUpdate = viewFieldsToPersist.filter(
          (viewFieldToPersit) =>
            savedViewFieldsByKey[viewFieldToPersit.fieldId] &&
            (savedViewFieldsByKey[viewFieldToPersit.fieldId].size !==
              viewFieldToPersit.size ||
              savedViewFieldsByKey[viewFieldToPersit.fieldId].position !==
                viewFieldToPersit.position ||
              savedViewFieldsByKey[viewFieldToPersit.fieldId].isVisible !==
                viewFieldToPersit.isVisible),
        );

        await _updateViewFields(viewFieldsToUpdate);
      },
  );

  return { persistViewFields };
};
