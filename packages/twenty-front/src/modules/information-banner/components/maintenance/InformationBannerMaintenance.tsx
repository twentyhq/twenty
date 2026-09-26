import { Temporal } from 'temporal-polyfill';

import { maintenanceModeState } from '@/client-config/states/maintenanceModeState';
import { InformationBanner } from '@/information-banner/components/InformationBanner';
import { useMaintenanceModeBannerDismissal } from '@/information-banner/hooks/useMaintenanceModeBannerDismissal';
import { type CalendarSystem } from '@/localization/constants/CalendarSystem';
import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { t } from '@lingui/core/macro';
import { getSafeUrl, isDefined } from 'twenty-shared/utils';
import { IconExternalLink } from 'twenty-ui/icon';

const formatMaintenanceDateTime = (
  isoString: string,
  timeZone: string,
  calendarSystem: CalendarSystem,
): string => {
  const zonedDateTime =
    Temporal.Instant.from(isoString).toZonedDateTimeISO(timeZone);

  return zonedDateTime.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short',
    calendar: calendarSystem,
  });
};

export const InformationBannerMaintenance = () => {
  const maintenanceMode = useAtomStateValue(maintenanceModeState);
  const { timeZone, calendarSystem } = useDateTimeFormat();
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
    calendarSystem,
  );
  const endFormatted = formatMaintenanceDateTime(
    maintenanceMode.endAt,
    timeZone,
    calendarSystem,
  );

  const message = t`Scheduled maintenance: ${startFormatted} — ${endFormatted}`;
  const maintenanceLink = getSafeUrl(maintenanceMode.link?.trim());

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
