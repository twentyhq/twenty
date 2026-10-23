import { useEffect } from 'react';

import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

export const ErrorMessageEffect = () => {
  const { enqueueToast } = useToast();
  const [searchParams] = useSearchParams();
  const { hash } = useLocation();
  const navigate = useNavigate();
  const errorMessage = searchParams.get('errorMessage');

  useEffect(() => {
    if (isDefined(errorMessage)) {
      enqueueToast({
        status: 'error',
        children: errorMessage,
        dedupeKey: 'error-message-dedupe-key',
      });
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('errorMessage');
      navigate({ search: newSearchParams.toString(), hash }, { replace: true });
    }
  }, [enqueueToast, errorMessage, hash, navigate, searchParams]);

  return <></>;
};
