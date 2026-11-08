import { InlineBanner } from 'twenty-ui/components/feedback';
import { IconAlertTriangle } from 'twenty-ui/icon';
import { useLingui } from '@lingui/react/macro';

type SettingsApplicationLoadErrorBannerProps = {
  message?: string;
  onRetry: () => void;
};

export const SettingsApplicationLoadErrorBanner = ({
  message,
  onRetry,
}: SettingsApplicationLoadErrorBannerProps) => {
  const { t } = useLingui();
  return (
    <InlineBanner
      status="error"
      icon={<IconAlertTriangle aria-hidden="true" />}
      action={
        <InlineBanner.Action onClick={onRetry}>{t`Retry`}</InlineBanner.Action>
      }
    >
      {message ??
        t`This application could not be loaded. Check your connection and try again.`}
    </InlineBanner>
  );
};
