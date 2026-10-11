import { useLingui } from '@lingui/react/macro';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from 'twenty-ui/components/feedback';

export const AppConnectionReusedEffect = () => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);

    if (searchParams.get('appConnectionReused') !== 'true') {
      return;
    }

    enqueueToast({
      variant: 'success',
      children: t`This account is already connected. Its connection has been updated.`,
      dedupeKey: 'app-connection-reused',
    });

    searchParams.delete('appConnectionReused');
    navigate(
      {
        pathname: location.pathname,
        search: searchParams.toString(),
        hash: location.hash,
      },
      { replace: true },
    );
  }, [enqueueToast, location, navigate, t]);

  return null;
};
