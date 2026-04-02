import { Temporal } from 'temporal-polyfill';

import { maintenanceModeState } from '@/client-config/states/maintenanceModeState';
import { InformationBanner } from '@/information-banner/components/InformationBanner';
import { useMaintenanceModeBannerDismissal } from '@/information-banner/hooks/useMaintenanceModeBannerDismissal';
import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { IconExternalLink } from 'twenty-ui/display';

const formatMaintenanceDateTime = (
  isoString: string,
  timeZone: string,
): string => {
  const zonedDateTime =
    Temporal.Instant.from(isoString).toZonedDateTimeISO(timeZone);

  return zonedDateTime.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short',
  });
};

export const InformationBannerMaintenance = () => {
  const maintenanceMode = useAtomStateValue(maintenanceModeState);
  const { timeZone } = useDateTimeFormat();
  const { dismissBanner, isDismissed, isLoading } =
    useMaintenanceModeBannerDismissal({
      enabled: isDefined(maintenanceMode),
      maintenanceStartAt: maintenanceMode?.startAt,
    });

  if (!isDefined(maintenanceMode) || isLoading || isDismissed) {
    return null;
  }

  const startFormatted = formatMaintenanceDateTime(
    maintenanceMode.startAt,
    timeZone,
  );
  const endFormatted = formatMaintenanceDateTime(
    maintenanceMode.endAt,
    timeZone,
  );

  const message = t`Scheduled maintenance: ${startFormatted} — ${endFormatted}`;
  const maintenanceLink = isNonEmptyString(maintenanceMode.link?.trim())
    ? maintenanceMode.link.trim()
    : undefined;

  return (
    <InformationBanner
      componentInstanceId="information-banner-maintenance"
      variant="secondary"
      message={message}
      buttonTitle={isDefined(maintenanceLink) ? t`Learn more` : undefined}
      buttonIcon={isDefined(maintenanceLink) ? IconExternalLink : undefined}
      buttonOnClick={
        isDefined(maintenanceLink)
          ? () => window.open(maintenanceLink, '_blank', 'noopener,noreferrer')
          : undefined
      }
      onClose={dismissBanner}
    />
  );
};
