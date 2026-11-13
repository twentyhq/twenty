import { useCallback } from 'react';

import { type FlatViewTab } from '@/metadata-store/types/FlatViewTab';
import { usePerformViewEntityApiPersistOperation } from '@/views/hooks/internal/usePerformViewEntityApiPersistOperation';
import { useMutation } from '@apollo/client/react';
import { CrudOperationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  type CreateViewTabInput,
  type UpdateViewTabInput,
  type ViewTabFragmentFragment,
  CreateViewTabDocument,
  DestroyViewTabDocument,
  UpdateViewTabDocument,
} from '~/generated-metadata/graphql';

const toFlatViewTab = ({
  __typename,
  createdAt: _createdAt,
  updatedAt: _updatedAt,
  deletedAt: _deletedAt,
  ...viewTab
}: ViewTabFragmentFragment): FlatViewTab => viewTab;

export const usePerformViewTabApiPersist = () => {
  const [createViewTabMutation] = useMutation(CreateViewTabDocument);
  const [updateViewTabMutation] = useMutation(UpdateViewTabDocument);
  const [destroyViewTabMutation] = useMutation(DestroyViewTabDocument);

  const { performViewEntityApiPersistOperation } =
    usePerformViewEntityApiPersistOperation('viewTab');

  const performViewTabApiCreate = useCallback(
    async (input: CreateViewTabInput) =>
      performViewEntityApiPersistOperation({
        persist: () => createViewTabMutation({ variables: { input } }),
        applyResultToDraft: (result, { addToDraft }) => {
          const createdViewTab = result.data?.createViewTab;

          if (isDefined(createdViewTab)) {
            addToDraft({
              key: 'viewTabs',
              items: [toFlatViewTab(createdViewTab)],
            });
          }
        },
        operationType: CrudOperationType.CREATE,
      }),
    [createViewTabMutation, performViewEntityApiPersistOperation],
  );

  const performViewTabApiUpdate = useCallback(
    async (input: UpdateViewTabInput) =>
      performViewEntityApiPersistOperation({
        persist: () => updateViewTabMutation({ variables: { input } }),
        applyResultToDraft: (result, { updateInDraft }) => {
          const updatedViewTab = result.data?.updateViewTab;

          if (isDefined(updatedViewTab)) {
            updateInDraft('viewTabs', [toFlatViewTab(updatedViewTab)]);
          }
        },
        operationType: CrudOperationType.UPDATE,
      }),
    [updateViewTabMutation, performViewEntityApiPersistOperation],
  );

  const performViewTabApiDestroy = useCallback(
    async (viewTabId: string) =>
      performViewEntityApiPersistOperation({
        persist: () =>
          destroyViewTabMutation({ variables: { input: { id: viewTabId } } }),
        applyResultToDraft: (_result, { removeFromDraft }) =>
          removeFromDraft({ key: 'viewTabs', itemIds: [viewTabId] }),
        operationType: CrudOperationType.DESTROY,
      }),
    [destroyViewTabMutation, performViewEntityApiPersistOperation],
  );

  return {
    performViewTabApiCreate,
    performViewTabApiUpdate,
    performViewTabApiDestroy,
  };
};
