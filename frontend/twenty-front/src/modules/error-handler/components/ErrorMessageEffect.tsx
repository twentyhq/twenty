import { useEffect } from 'react';

import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useSearchParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

export const ErrorMessageEffect = () => {
  const { enqueueErrorSnackBar } = useSnackBar();
  const [searchParams, setSearchParams] = useSearchParams();
  const errorMessage = searchParams.get('errorMessage');

  useEffect(() => {
    if (isDefined(errorMessage)) {
      enqueueErrorSnackBar({
        message: errorMessage,
        options: {
          dedupeKey: 'error-message-dedupe-key',
        },
      });
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('errorMessage');
      setSearchParams(newSearchParams);
    }
  }, [enqueueErrorSnackBar, errorMessage, searchParams, setSearchParams]);

  return <></>;
};
