import { maintenanceModeState } from '@/client-config/states/maintenanceModeState';
import { InformationBanner } from '@/information-banner/components/InformationBanner';
import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconExternalLink } from 'twenty-ui/display';

const formatMaintenanceDateTime = (
  isoString: string,
  timeZone: string,
): string => {
  const date = new Date(isoString);

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZone,
    timeZoneName: 'short',
  }).format(date);
};

export const InformationBannerMaintenance = () => {
  const maintenanceMode = useAtomStateValue(maintenanceModeState);
  const { timeZone } = useDateTimeFormat();

  if (!isDefined(maintenanceMode)) {
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

  return (
    <InformationBanner
      componentInstanceId="information-banner-maintenance"
      variant="default"
      message={message}
      buttonTitle={maintenanceMode.link ? t`Learn more` : undefined}
      buttonIcon={maintenanceMode.link ? IconExternalLink : undefined}
      buttonOnClick={
        maintenanceMode.link
          ? () => window.open(maintenanceMode.link, '_blank')
          : undefined
      }
    />
  );
};
