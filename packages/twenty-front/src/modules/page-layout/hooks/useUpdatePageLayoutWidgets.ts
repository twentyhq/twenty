import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { type FlatPageLayoutWidget } from '@/metadata-store/types/FlatPageLayoutWidget';
import { useMutation } from '@apollo/client/react';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { t } from '@lingui/core/macro';
import { CrudOperationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import {
  type PageLayoutWidgetVerticalListPosition,
  UpdatePageLayoutWidgetDocument,
} from '~/generated-metadata/graphql';

export type PageLayoutWidgetUpdate = {
  widgetId: string;
  isActive?: boolean;
  position?: Omit<PageLayoutWidgetVerticalListPosition, '__typename'>;
};

export const useUpdatePageLayoutWidgets = () => {
  const [updatePageLayoutWidgetMutation] = useMutation(
    UpdatePageLayoutWidgetDocument,
  );

  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueToast } = useToast();
  const { updateInDraft, applyChanges } = useUpdateMetadataStoreDraft();

  const updatePageLayoutWidgets = async (
    pageLayoutWidgetUpdates: PageLayoutWidgetUpdate[],
  ): Promise<{ status: 'successful' | 'failed' }> => {
    const pageLayoutWidgetInputByWidgetId = new Map<
      string,
      Omit<PageLayoutWidgetUpdate, 'widgetId'>
    >();

    for (const { widgetId, ...input } of pageLayoutWidgetUpdates) {
      pageLayoutWidgetInputByWidgetId.set(widgetId, {
        ...pageLayoutWidgetInputByWidgetId.get(widgetId),
        ...input,
      });
    }

    try {
      for (const [widgetId, input] of pageLayoutWidgetInputByWidgetId) {
        const response = await updatePageLayoutWidgetMutation({
          variables: { id: widgetId, input },
        });

        const updatedWidget = response.data?.updatePageLayoutWidget;

        if (isDefined(updatedWidget)) {
          updateInDraft('pageLayoutWidgets', [
            {
              id: updatedWidget.id,
              isActive: updatedWidget.isActive,
              position: updatedWidget.position,
            } as FlatPageLayoutWidget,
          ]);
        }
      }

      return { status: 'successful' };
    } catch (error) {
      if (CombinedGraphQLErrors.is(error)) {
        handleMetadataError(error, {
          primaryMetadataName: 'pageLayoutWidget',
          operationType: CrudOperationType.UPDATE,
        });
      } else {
        enqueueToast({ status: 'error', children: t`An error occurred.` });
      }

      return { status: 'failed' };
    } finally {
      applyChanges();
    }
  };

  return { updatePageLayoutWidgets };
};
