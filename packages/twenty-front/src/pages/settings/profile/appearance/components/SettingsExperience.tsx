import { styled } from '@linaria/react';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { BrowserNotificationPermissionCard } from '@/settings/experience/components/BrowserNotificationPermissionCard';
import { FormatPreferencesSettings } from '@/settings/experience/components/FormatPreferencesSettings';
import { InboxNotificationLevelPicker } from '@/settings/experience/components/InboxNotificationLevelPicker';
import { InboxNotificationPreviewSwitch } from '@/settings/experience/components/InboxNotificationPreviewSwitch';
import { OpenRecordInPreferencePicker } from '@/settings/experience/components/OpenRecordInPreferencePicker';
import { UiScalePicker } from '@/settings/experience/components/UiScalePicker';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { Trans, useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { themeCssVariables } from 'twenty-ui/theme';
import { SettingsAppearance } from '~/pages/settings/profile/appearance/components/SettingsAppearance';
import { LocalePicker } from '~/pages/settings/profile/appearance/components/LocalePicker';
import {
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

const StyledInterfaceControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

export const SettingsExperience = () => {
  const { t } = useLingui();
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);

  return (
    <SettingsPageLayout
      title={t`Experience`}
      links={[
        {
          children: <Trans>User</Trans>,
          href: getSettingsPath(SettingsPath.ProfilePage),
        },
        { children: <Trans>Experience</Trans> },
      ]}
    >
      <SettingsPageContainer>
        <SettingsAppearance />

        <Section.Root>
          <Section.Header
            title={t`Interface`}
            description={t`Select your language and adjust the size of the interface`}
          />
          <StyledInterfaceControls>
            <LocalePicker />
            <UiScalePicker />
          </StyledInterfaceControls>
        </Section.Root>

        <Section.Root>
          <Section.Header
            title={t`Navigation`}
            description={t`Choose where records open by default. Some objects may use a workspace setting`}
          />
          <OpenRecordInPreferencePicker />
        </Section.Root>

        {isAiChatInboxEnabled && hasAiPermission && (
          <Section.Root>
            <Section.Header
              title={t`Notifications`}
              description={t`Get desktop notifications for new messages while Twenty is open but isn't the window you're using. These settings apply to this browser`}
            />
            <StyledInterfaceControls>
              <BrowserNotificationPermissionCard />
              <InboxNotificationLevelPicker />
              <InboxNotificationPreviewSwitch />
            </StyledInterfaceControls>
          </Section.Root>
        )}

        <Section.Root>
          <Section.Header
            title={t`Formats`}
            description={t`Configure date, time, number, timezone, and calendar start day`}
          />
          <FormatPreferencesSettings />
        </Section.Root>
        {/* Unified into FormatPreferencesSettings */}
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
