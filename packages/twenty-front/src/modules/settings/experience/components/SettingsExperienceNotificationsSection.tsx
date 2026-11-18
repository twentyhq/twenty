import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Section } from 'twenty-ui/components/layout';
import { themeCssVariables } from 'twenty-ui/theme';

import { BrowserNotificationPermissionCard } from '@/settings/experience/components/BrowserNotificationPermissionCard';
import { InboxNotificationLevelPicker } from '@/settings/experience/components/InboxNotificationLevelPicker';
import { InboxNotificationPreviewSwitch } from '@/settings/experience/components/InboxNotificationPreviewSwitch';
import { useIsWebPushAvailable } from '@/web-push/hooks/useIsWebPushAvailable';

const StyledNotificationControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

export const SettingsExperienceNotificationsSection = () => {
  const { t } = useLingui();
  const isWebPushAvailable = useIsWebPushAvailable();

  if (!isWebPushAvailable) {
    return null;
  }

  return (
    <Section.Root>
      <Section.Header
        title={t`Notifications`}
        description={t`Get notified of new inbox messages on this device, even when Twenty is closed. Your choices below apply to every device`}
      />
      <StyledNotificationControls>
        <BrowserNotificationPermissionCard />
        <InboxNotificationLevelPicker />
        <InboxNotificationPreviewSwitch />
      </StyledNotificationControls>
    </Section.Root>
  );
};
