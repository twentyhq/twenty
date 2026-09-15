import { getMissingCreateCalendarEventScopes } from '@/accounts/utils/hasMissingCreateCalendarEventScopes';
import { useResolveDefaultEmailRecipient } from '@/activities/emails/hooks/useResolveDefaultEmailRecipient';
import { isCalendarCreationEnabledForAccount } from '@/activities/calendar/utils/isCalendarCreationEnabledForAccount';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useMyConnectedAccounts } from '@/settings/accounts/hooks/useMyConnectedAccounts';
import { useOpenComposeCalendarEventInSidePanel } from '@/side-panel/hooks/useOpenComposeCalendarEventInSidePanel';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { isNonEmptyString } from '@sniptt/guards';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const useComposeCalendarEventForTargetRecord = (
  targetRecord: ActivityTargetableObject,
) => {
  const navigateSettings = useNavigateSettings();
  const { userTimezone } = useUserTimezone();
  const { accounts, loading: accountsLoading } = useMyConnectedAccounts();
  const { openComposeCalendarEventInSidePanel } =
    useOpenComposeCalendarEventInSidePanel();

  const {
    defaultRecipientPersonId,
    defaultTo,
    loading: recipientLoading,
  } = useResolveDefaultEmailRecipient({
    objectNameSingular: targetRecord.targetObjectNameSingular,
    recordId: targetRecord.id,
  });

  const calendarAccounts = accounts.filter(isCalendarCreationEnabledForAccount);

  const preferredAccount =
    calendarAccounts.find(
      (account) => getMissingCreateCalendarEventScopes(account).length === 0,
    ) ?? calendarAccounts[0];

  const openComposer = () => {
    if (!isNonEmptyString(defaultTo)) {
      return;
    }

    if (!isDefined(preferredAccount)) {
      navigateSettings(SettingsPath.NewAccount);

      return;
    }

    openComposeCalendarEventInSidePanel({
      connectedAccountId: preferredAccount.id,
      contextRecord: {
        objectNameSingular: targetRecord.targetObjectNameSingular,
        recordId: targetRecord.id,
      },
      defaultAttendees: defaultTo,
      defaultAttendeePersonId: defaultRecipientPersonId,
      timeZone: userTimezone,
    });
  };

  return {
    openComposer,
    loading: accountsLoading || recipientLoading,
    disabled:
      accountsLoading || recipientLoading || !isNonEmptyString(defaultTo),
  };
};
