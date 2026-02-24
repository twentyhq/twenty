import { clientConfigApiStatusState } from '@/client-config/states/clientConfigApiStatusState';
import { useAtomValue } from '@/ui/utilities/state/jotai/hooks/useAtomValue';
import { AppFullScreenErrorFallback } from '@/error-handler/components/AppFullScreenErrorFallback';
import { useLingui } from '@lingui/react/macro';

export const ClientConfigProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { isErrored, error } = useAtomValue(clientConfigApiStatusState);
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
