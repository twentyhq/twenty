import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useCallback } from 'react';
import { CrudOperationType } from 'twenty-shared/types';
import { ResetPageLayoutWidgetToDefaultDocument } from '~/generated-metadata/graphql';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { useRefreshPageLayoutAfterReset } from '@/page-layout/hooks/useRefreshPageLayoutAfterReset';
import { collectViewIdsFromWidgets } from '@/page-layout/utils/collectViewIdsFromWidgets';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

export const useResetPageLayoutWidgetToDefault = (
  pageLayoutIdFromProps: string,
) => {
  const [resetMutation] = useMutation(ResetPageLayoutWidgetToDefaultDocument);
  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueErrorSnackBar } = useSnackBar();
  const { refreshPageLayoutAfterReset } = useRefreshPageLayoutAfterReset(
    pageLayoutIdFromProps,
  );

  const resetPageLayoutWidgetToDefault = useCallback(
    async (widgetId: string) => {
      try {
        await resetMutation({ variables: { id: widgetId } });
        await refreshPageLayoutAfterReset((layout) =>
          collectViewIdsFromWidgets(
            layout.tabs
              .flatMap((tab) => tab.widgets)
              .filter((widget) => widget.id === widgetId),
          ),
        );
      } catch (error) {
        if (CombinedGraphQLErrors.is(error)) {
          handleMetadataError(error, {
            primaryMetadataName: 'pageLayoutWidget',
            operationType: CrudOperationType.UPDATE,
          });
        } else {
          enqueueErrorSnackBar({ message: t`An error occurred.` });
        }
      }
    },
    [
      resetMutation,
      refreshPageLayoutAfterReset,
      handleMetadataError,
      enqueueErrorSnackBar,
    ],
  );

  return { resetPageLayoutWidgetToDefault };
};
