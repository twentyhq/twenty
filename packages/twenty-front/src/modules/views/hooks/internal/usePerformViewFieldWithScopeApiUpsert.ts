import { useCallback } from 'react';

import { type FlatViewField } from '@/metadata-store/types/FlatViewField';
import { splitViewWithRelated } from '@/metadata-store/utils/splitViewWithRelated';
import { usePerformViewEntityApiPersistOperation } from '@/views/hooks/internal/usePerformViewEntityApiPersistOperation';
import { scopeViewsByOwnerViewFieldIdMapSelector } from '@/views/states/selectors/scopeViewsByOwnerViewFieldIdMapSelector';
import { useMutation } from '@apollo/client/react';
import { useStore } from 'jotai';
import { doNotTranslate } from 'twenty-shared/i18n';
import { CrudOperationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  type UpsertViewFieldWithScopeInput,
  UpsertViewFieldWithScopeDocument,
} from '~/generated-metadata/graphql';

export const usePerformViewFieldWithScopeApiUpsert = () => {
  const [upsertViewFieldWithScopeMutation] = useMutation(
    UpsertViewFieldWithScopeDocument,
  );
  const store = useStore();

  const { performViewEntityApiPersistOperation } =
    usePerformViewEntityApiPersistOperation('viewField');

  const performViewFieldWithScopeApiUpsert = useCallback(
    async (input: UpsertViewFieldWithScopeInput) => {
      const result = await performViewEntityApiPersistOperation({
        persist: () =>
          upsertViewFieldWithScopeMutation({ variables: { input } }),
        applyResultToDraft: (
          mutationResult,
          { addToDraft, removeFromDraft },
        ) => {
          const upserted = mutationResult.data?.upsertViewFieldWithScope;

          if (!isDefined(upserted)) {
            throw new Error(doNotTranslate('Failed to save column'));
          }

          const previousScopeView = store
            .get(scopeViewsByOwnerViewFieldIdMapSelector.atom)
            .get(input.id);

          // The server diffs the scope by id, so dropping the previous children keeps only those it returns
          if (isDefined(previousScopeView)) {
            removeFromDraft({
              key: 'viewFilters',
              itemIds: previousScopeView.viewFilters.map(({ id }) => id),
            });
            removeFromDraft({
              key: 'viewFilterGroups',
              itemIds: (previousScopeView.viewFilterGroups ?? []).map(
                ({ id }) => id,
              ),
            });
            removeFromDraft({
              key: 'viewSorts',
              itemIds: previousScopeView.viewSorts.map(({ id }) => id),
            });

            if (previousScopeView.id !== upserted.scopeView?.id) {
              removeFromDraft({
                key: 'views',
                itemIds: [previousScopeView.id],
              });
            }
          }

          const { __typename, ...viewField } = upserted.viewField;

          addToDraft({
            key: 'viewFields',
            items: [viewField as FlatViewField],
          });

          if (!isDefined(upserted.scopeView)) {
            return;
          }

          const {
            flatViews,
            flatViewFilters,
            flatViewFilterGroups,
            flatViewSorts,
          } = splitViewWithRelated([upserted.scopeView]);

          addToDraft({ key: 'views', items: flatViews });
          addToDraft({ key: 'viewFilters', items: flatViewFilters });
          addToDraft({ key: 'viewFilterGroups', items: flatViewFilterGroups });
          addToDraft({ key: 'viewSorts', items: flatViewSorts });
        },
        operationType: CrudOperationType.UPDATE,
      });

      return result.status === 'successful';
    },
    [
      performViewEntityApiPersistOperation,
      store,
      upsertViewFieldWithScopeMutation,
    ],
  );

  return { performViewFieldWithScopeApiUpsert };
};
