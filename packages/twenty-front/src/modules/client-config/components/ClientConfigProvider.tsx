import { useRecoilValue } from 'recoil';

import { clientConfigApiStatusState } from '@/client-config/states/clientConfigApiStatusState';
import { AppFullScreenErrorFallback } from '@/error-handler/components/AppFullScreenErrorFallback';
import { useLingui } from '@lingui/react/macro';

export const ClientConfigProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { isErrored, error } = useRecoilValue(clientConfigApiStatusState);
  const { t } = useLingui();

  return isErrored && error instanceof Error ? (
    <AppFullScreenErrorFallback
      error={error}
      resetErrorBoundary={() => {
        window.location.reload();
      }}
      title={t`Unable to Reach Back-end`}
    />
  ) : (
    children
  );
};
