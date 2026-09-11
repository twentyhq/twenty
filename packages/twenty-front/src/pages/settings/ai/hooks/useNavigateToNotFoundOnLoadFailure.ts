import { type ErrorLike } from '@apollo/client';
import { useEffect } from 'react';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const useNavigateToNotFoundOnLoadFailure = ({
  hasFailedToLoad,
  error,
  notFoundMessage,
}: {
  hasFailedToLoad: boolean;
  error?: ErrorLike;
  notFoundMessage: string;
}) => {
  const navigateApp = useNavigateApp();
  const { enqueueErrorSnackBar } = useSnackBar();

  useEffect(() => {
    if (!hasFailedToLoad) {
      return;
    }

    enqueueErrorSnackBar(
      isDefined(error) ? { apolloError: error } : { message: notFoundMessage },
    );
    navigateApp(AppPath.NotFound);
  }, [
    hasFailedToLoad,
    error,
    notFoundMessage,
    enqueueErrorSnackBar,
    navigateApp,
  ]);
};
