import { useCallback } from 'react';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { splitViewWithRelated } from '@/metadata-store/utils/splitViewWithRelated';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useViewsSideEffectsOnViewGroups } from '@/views/hooks/useViewsSideEffectsOnViewGroups';
import { type ViewWithRelations } from '@/views/types/ViewWithRelations';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { t } from '@lingui/core/macro';
import { CrudOperationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { useMutation } from '@apollo/client/react';
import {
  type CreateViewMutationVariables,
  type DestroyViewMutationVariables,
  ViewType,
  CreateViewDocument,
  DestroyViewDocument,
} from '~/generated-metadata/graphql';

export const usePerformViewAPIPersist = () => {
  const [createViewMutation] = useMutation(CreateViewDocument);
  const [destroyViewMutation] = useMutation(DestroyViewDocument);
  const { triggerViewGroupOptimisticEffectAtViewCreation } =
    useViewsSideEffectsOnViewGroups();

  const { addToDraft, applyChanges } = useUpdateMetadataStoreDraft();

  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueErrorSnackBar } = useSnackBar();

  const performViewAPICreate = useCallback(
    async (
      variables: CreateViewMutationVariables,
      objectMetadataItemId: string,
    ): Promise<
      MetadataRequestResult<Awaited<ReturnType<typeof createViewMutation>>>
    > => {
      try {
        const newViewId = variables.input.id ?? v4();
        if (variables.input.type === ViewType.KANBAN) {
          triggerViewGroupOptimisticEffectAtViewCreation({
            objectMetadataItemId: objectMetadataItemId,
            mainGroupByFieldMetadataId:
              variables.input.mainGroupByFieldMetadataId,
          });
        }

        const result = await createViewMutation({
          variables: {
            input: {
              ...variables.input,
              id: newViewId,
            },
          },
        });

        const newView = result.data?.createView;

        if (!isDefined(newView)) {
          return {
            status: 'failed',
            error: new Error('Failed to create view'),
          };
        }

        // Add the freshly created view (and its server-created relations, e.g.
        // Kanban view groups) to the local metadata store so it shows up in the
        // views list / sidebar immediately, without waiting for an SSE event or
        // a full page refresh.
        const {
          flatViews,
          flatViewFields,
          flatViewFilters,
          flatViewSorts,
          flatViewGroups,
          flatViewFilterGroups,
          flatViewFieldGroups,
        } = splitViewWithRelated([newView as unknown as ViewWithRelations]);

        addToDraft({ key: 'views', items: flatViews });
        addToDraft({ key: 'viewFields', items: flatViewFields });
        addToDraft({ key: 'viewFilters', items: flatViewFilters });
        addToDraft({ key: 'viewSorts', items: flatViewSorts });
        addToDraft({ key: 'viewGroups', items: flatViewGroups });
        addToDraft({ key: 'viewFilterGroups', items: flatViewFilterGroups });
        addToDraft({ key: 'viewFieldGroups', items: flatViewFieldGroups });
        applyChanges();

        return {
          status: 'successful',
          response: result,
        };
      } catch (error) {
        if (CombinedGraphQLErrors.is(error)) {
          handleMetadataError(error, {
            primaryMetadataName: 'view',
            operationType: CrudOperationType.CREATE,
          });
        } else {
          enqueueErrorSnackBar({ message: t`An error occurred.` });
        }

        return {
          status: 'failed',
          error,
        };
      }
    },
    [
      createViewMutation,
      triggerViewGroupOptimisticEffectAtViewCreation,
      addToDraft,
      applyChanges,
      handleMetadataError,
      enqueueErrorSnackBar,
    ],
  );

  const performViewAPIDestroy = useCallback(
    async (
      variables: DestroyViewMutationVariables,
    ): Promise<
      MetadataRequestResult<Awaited<ReturnType<typeof destroyViewMutation>>>
    > => {
      try {
        const result = await destroyViewMutation({
          variables,
        });

        return {
          status: 'successful',
          response: result,
        };
      } catch (error) {
        if (CombinedGraphQLErrors.is(error)) {
          handleMetadataError(error, {
            primaryMetadataName: 'view',
            operationType: CrudOperationType.DELETE,
          });
        } else {
          enqueueErrorSnackBar({ message: t`An error occurred.` });
        }

        return {
          status: 'failed',
          error,
        };
      }
    },
    [destroyViewMutation, handleMetadataError, enqueueErrorSnackBar],
  );

  return {
    performViewAPICreate,
    performViewAPIDestroy,
  };
};
