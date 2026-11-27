import { SETTINGS_ROW_CONTROL_WIDTH } from '@/settings/constants/SettingsRowControlWidth';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { StyledSettingsSelectGroup } from '@/settings/components/SettingsOptions/StyledSettingsSelectGroup';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { FormatPreferencesSettings } from '@/settings/experience/components/FormatPreferencesSettings';
import { OpenRecordInPreferencePicker } from '@/settings/experience/components/OpenRecordInPreferencePicker';
import { SettingsExperienceNotificationsSection } from '@/settings/experience/components/SettingsExperienceNotificationsSection';
import { UiScalePicker } from '@/settings/experience/components/UiScalePicker';
import { Trans, useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { IconLanguage, IconTextSize } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/primitives/surfaces';
import { SettingsAppearance } from '~/pages/settings/profile/appearance/components/SettingsAppearance';
import { LocalePicker } from '~/pages/settings/profile/appearance/components/LocalePicker';

export const SettingsExperience = () => {
  const { t } = useLingui();

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
          <StyledSettingsSelectGroup controlWidth={SETTINGS_ROW_CONTROL_WIDTH}>
            <Card.Root>
              <SettingsOptionCardContentSelect
                Icon={IconLanguage}
                title={t`Language`}
                description={t`Used across the interface for you`}
                divider
              >
                <LocalePicker />
              </SettingsOptionCardContentSelect>
              <SettingsOptionCardContentSelect
                Icon={IconTextSize}
                title={t`Scale`}
                description={t`Size of the interface, or the workspace default`}
              >
                <UiScalePicker />
              </SettingsOptionCardContentSelect>
            </Card.Root>
          </StyledSettingsSelectGroup>
        </Section.Root>

        <Section.Root>
          <Section.Header
            title={t`Navigation`}
            description={t`Choose where records open by default. Some objects may use a workspace setting`}
          />
          <OpenRecordInPreferencePicker />
        </Section.Root>

        <SettingsExperienceNotificationsSection />

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
