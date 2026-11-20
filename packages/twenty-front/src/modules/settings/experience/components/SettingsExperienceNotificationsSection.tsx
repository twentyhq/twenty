import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Section } from 'twenty-ui/components/layout';
import { themeCssVariables } from 'twenty-ui/theme';

import { useIsInboxWebPushEnabled } from '@/inbox/hooks/useIsInboxWebPushEnabled';
import { BrowserNotificationPermissionCard } from '@/settings/experience/components/BrowserNotificationPermissionCard';
import { InboxNotificationPreferences } from '@/settings/experience/components/InboxNotificationPreferences';

const StyledNotificationControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

export const SettingsExperienceNotificationsSection = () => {
  const { t } = useLingui();
  const isInboxWebPushEnabled = useIsInboxWebPushEnabled();

  if (!isInboxWebPushEnabled) {
    return null;
  }

  return (
    <Section.Root>
      <Section.Header
        title={t`Notifications`}
        description={t`Get notified of new inbox messages on this device when you are not looking at Twenty. Your choices below apply to every device`}
      />
      <StyledNotificationControls>
        <BrowserNotificationPermissionCard />
        <InboxNotificationPreferences />
      </StyledNotificationControls>
    </Section.Root>
  );
};
