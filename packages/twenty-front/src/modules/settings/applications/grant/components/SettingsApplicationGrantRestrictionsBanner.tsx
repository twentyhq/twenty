import { t } from '@lingui/core/macro';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { IconAlertTriangle } from 'twenty-ui/icon';

export const SettingsApplicationGrantRestrictionsBanner = () => (
  <InlineBanner
    status="warning"
    icon={<IconAlertTriangle aria-hidden="true" />}
  >{t`Some fields or records are hidden from this app. Some of its features may stop working.`}</InlineBanner>
);
