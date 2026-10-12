import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { type FlatPageLayoutWidget } from '@/metadata-store/types/FlatPageLayoutWidget';
import { useMutation } from '@apollo/client/react';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { t } from '@lingui/core/macro';
import { CrudOperationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { UpdatePageLayoutWidgetIsActiveDocument } from '~/generated-metadata/graphql';

export type PageLayoutWidgetIsActiveUpdate = {
  widgetId: string;
  isActive: boolean;
};

export const useUpdatePageLayoutWidgetsIsActive = () => {
  const [updatePageLayoutWidgetIsActiveMutation] = useMutation(
    UpdatePageLayoutWidgetIsActiveDocument,
  );

  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueToast } = useToast();
  const { updateInDraft, applyChanges } = useUpdateMetadataStoreDraft();

  const updatePageLayoutWidgetsIsActive = async (
    pageLayoutWidgetIsActiveUpdates: PageLayoutWidgetIsActiveUpdate[],
  ): Promise<{ status: 'successful' | 'failed' }> => {
    try {
      for (const { widgetId, isActive } of pageLayoutWidgetIsActiveUpdates) {
        const response = await updatePageLayoutWidgetIsActiveMutation({
          variables: { id: widgetId, isActive },
        });

        const updatedWidget = response.data?.updatePageLayoutWidget;

        if (isDefined(updatedWidget)) {
          updateInDraft('pageLayoutWidgets', [
            {
              id: updatedWidget.id,
              isActive: updatedWidget.isActive,
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
        enqueueToast({ variant: 'error', children: t`An error occurred.` });
      }

      return { status: 'failed' };
    } finally {
      applyChanges();
    }
  };

  return { updatePageLayoutWidgetsIsActive };
};
