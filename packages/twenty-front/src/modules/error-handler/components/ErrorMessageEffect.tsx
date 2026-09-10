import { useEffect } from 'react';

import { useSearchParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/feedback';

export const ErrorMessageEffect = () => {
  const { enqueueToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const errorMessage = searchParams.get('errorMessage');

  useEffect(() => {
    if (isDefined(errorMessage)) {
      enqueueToast({
        variant: 'error',
        children: errorMessage,
        dedupeKey: 'error-message-dedupe-key',
      });
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('errorMessage');
      setSearchParams(newSearchParams);
    }
  }, [enqueueToast, errorMessage, searchParams, setSearchParams]);

  return <></>;
};
