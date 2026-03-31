import { Temporal } from 'temporal-polyfill';
import { useState } from 'react';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { maintenanceModeState } from '@/client-config/states/maintenanceModeState';
import { InformationBanner } from '@/information-banner/components/InformationBanner';
import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconExternalLink } from 'twenty-ui/display';

const DISMISSED_STORAGE_KEY_PREFIX = 'maintenance-banner-dismissed';

const getDismissedStorageKey = (memberId: string) =>
  `${DISMISSED_STORAGE_KEY_PREFIX}-${memberId}`;

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
  const currentWorkspaceMember = useAtomStateValue(
    currentWorkspaceMemberState,
  );
  const { timeZone } = useDateTimeFormat();

  const [isDismissed, setIsDismissed] = useState(() => {
    if (!isDefined(currentWorkspaceMember) || !isDefined(maintenanceMode)) {
      return false;
    }
    const dismissed = localStorage.getItem(
      getDismissedStorageKey(currentWorkspaceMember.id),
    );
    return dismissed === maintenanceMode.startAt;
  });

  if (!isDefined(maintenanceMode) || isDismissed) {
    return null;
  }

  const handleClose = () => {
    if (isDefined(currentWorkspaceMember)) {
      localStorage.setItem(
        getDismissedStorageKey(currentWorkspaceMember.id),
        maintenanceMode.startAt,
      );
    }
    setIsDismissed(true);
  };

  const startFormatted = formatMaintenanceDateTime(
    maintenanceMode.startAt,
    timeZone,
  );
  const endFormatted = formatMaintenanceDateTime(
    maintenanceMode.endAt,
    timeZone,
  );

  const message = t`Scheduled maintenance: ${startFormatted} — ${endFormatted}`;
  const maintenanceLink = maintenanceMode.link ?? undefined;

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
      onClose={handleClose}
    />
  );
};
