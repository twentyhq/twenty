import { settingsBannerFamilyState } from '@/front-components/states/settingsBannerFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { Suspense, lazy } from 'react';
import { SETTINGS_BANNER_ACTION_BROWSER_EVENT_NAME } from 'twenty-shared/constants';
import {
  type SettingsBannerActionBrowserEventDetail,
  type SettingsBannerVariant,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconInfoCircle,
  type IconComponent,
} from 'twenty-ui/icon';
import { type BannerColor, InlineBanner } from 'twenty-ui/primitives/feedback';

const FrontComponentRenderer = lazy(() =>
  import('@/front-components/components/FrontComponentRenderer').then(
    (module) => ({ default: module.FrontComponentRenderer }),
  ),
);

const BANNER_COLOR_BY_VARIANT: Record<SettingsBannerVariant, BannerColor> = {
  info: 'blue',
  warning: 'warning',
  error: 'danger',
};

const BANNER_ICON_BY_VARIANT: Record<SettingsBannerVariant, IconComponent> = {
  info: IconInfoCircle,
  warning: IconAlertTriangle,
  error: IconAlertCircle,
};

type SettingsApplicationBannerProps = {
  frontComponentId: string;
};

export const SettingsApplicationBanner = ({
  frontComponentId,
}: SettingsApplicationBannerProps) => {
  const settingsBanner = useAtomFamilyStateValue(
    settingsBannerFamilyState,
    frontComponentId,
  );

  const variant = settingsBanner?.variant ?? 'info';

  const handleActionClick = () => {
    window.dispatchEvent(
      new CustomEvent<SettingsBannerActionBrowserEventDetail>(
        SETTINGS_BANNER_ACTION_BROWSER_EVENT_NAME,
        { detail: { frontComponentId } },
      ),
    );
  };

  return (
    <>
      <Suspense fallback={null}>
        <FrontComponentRenderer frontComponentId={frontComponentId} />
      </Suspense>
      {isDefined(settingsBanner) && (
        <InlineBanner
          color={BANNER_COLOR_BY_VARIANT[variant]}
          LeftIcon={BANNER_ICON_BY_VARIANT[variant]}
          message={settingsBanner.text}
          button={
            isDefined(settingsBanner.action)
              ? {
                  title: settingsBanner.action.label,
                  onClick: handleActionClick,
                }
              : undefined
          }
        />
      )}
    </>
  );
};
