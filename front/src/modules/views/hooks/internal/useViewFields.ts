import { useApolloClient } from '@apollo/client';
import { useRecoilCallback } from 'recoil';

import { ColumnDefinition } from '@/ui/data/data-table/types/ColumnDefinition';
import { FieldMetadata } from '@/ui/data/field/types/FieldMetadata';
import { currentViewIdScopedState } from '@/views/states/currentViewIdScopedState';
import { savedViewFieldByKeyScopedFamilySelector } from '@/views/states/selectors/savedViewFieldByKeyScopedFamilySelector';
import { viewObjectIdScopeState } from '@/views/states/viewObjectIdScopeState';
import {
  CreateViewFieldsDocument,
  UpdateViewFieldDocument,
} from '~/generated/graphql';

export const toViewFieldInput = (
  objectId: string,
  fieldDefinition: ColumnDefinition<FieldMetadata>,
) => ({
  key: fieldDefinition.key,
  name: fieldDefinition.name,
  index: fieldDefinition.index,
  isVisible: fieldDefinition.isVisible ?? true,
  objectId,
  size: fieldDefinition.size,
});

export const useViewFields = (viewScopeId: string) => {
  const apolloClient = useApolloClient();

  const persistViewFields = useRecoilCallback(
    ({ snapshot }) =>
      async (
        viewFieldsToPersist: ColumnDefinition<FieldMetadata>[],
        viewId?: string,
      ) => {
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
        const _createViewFields = (
          viewFieldsToCreate: ColumnDefinition<FieldMetadata>[],
          objectId: string,
        ) => {
          if (!currentViewId || !viewFieldsToCreate.length) {
            return;
          }

          return apolloClient.mutate({
            mutation: CreateViewFieldsDocument,
            variables: {
              data: viewFieldsToCreate.map((viewField) => ({
                ...toViewFieldInput(objectId, viewField),
                viewId: viewId ?? currentViewId,
              })),
            },
          });
        };

        const _updateViewFields = (
          viewFieldsToUpdate: ColumnDefinition<FieldMetadata>[],
        ) => {
          if (!currentViewId || !viewFieldsToUpdate.length) {
            return;
          }

          return Promise.all(
            viewFieldsToUpdate.map((viewField) =>
              apolloClient.mutate({
                mutation: UpdateViewFieldDocument,
                variables: {
                  data: {
                    isVisible: viewField.isVisible,
                    size: viewField.size,
                    index: viewField.index,
                  },
                  where: {
                    viewId_key: {
                      key: viewField.key,
                      viewId: viewId ?? currentViewId,
                    },
                  },
                },
              }),
            ),
          );
        };

        const viewFieldsToCreate = viewFieldsToPersist.filter(
          (viewField) => !savedViewFieldsByKey[viewField.key],
        );
        await _createViewFields(viewFieldsToCreate, viewObjectId);

        const viewFieldsToUpdate = viewFieldsToPersist.filter(
          (viewFieldToPersit) =>
            savedViewFieldsByKey[viewFieldToPersit.key] &&
            (savedViewFieldsByKey[viewFieldToPersit.key].size !==
              viewFieldToPersit.size ||
              savedViewFieldsByKey[viewFieldToPersit.key].index !==
                viewFieldToPersit.index ||
              savedViewFieldsByKey[viewFieldToPersit.key].isVisible !==
                viewFieldToPersit.isVisible),
        );

        await _updateViewFields(viewFieldsToUpdate);
      },
  );

  return { persistViewFields };
};
