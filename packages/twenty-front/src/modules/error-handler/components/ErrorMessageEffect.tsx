import { useEffect } from 'react';

import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useSearchParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

export const ErrorMessageEffect = () => {
  const { enqueueSnackBar } = useSnackBar();
  const [searchParams, setSearchParams] = useSearchParams();
  const errorMessage = searchParams.get('errorMessage');

  useEffect(() => {
    if (isDefined(errorMessage)) {
      enqueueSnackBar(errorMessage, {
        dedupeKey: 'error-message-dedupe-key',
        variant: SnackBarVariant.Error,
      });
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('errorMessage');
      setSearchParams(newSearchParams);
    }
  }, [enqueueSnackBar, errorMessage, searchParams, setSearchParams]);

  return <></>;
};
