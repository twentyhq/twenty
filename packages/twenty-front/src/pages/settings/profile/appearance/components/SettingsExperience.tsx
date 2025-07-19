import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useColorScheme } from '@/ui/theme/hooks/useColorScheme';

import { Trans, useLingui } from '@lingui/react/macro';
import { useRecoilState } from 'recoil';
import { H2Title, IconCalendarEvent } from 'twenty-ui/display';
import { ColorSchemePicker } from 'twenty-ui/input';
import { Card, Section } from 'twenty-ui/layout';
import { DateTimeSettings } from '~/pages/settings/profile/appearance/components/DateTimeSettings';
import { LocalePicker } from '~/pages/settings/profile/appearance/components/LocalePicker';
import { logError } from '~/utils/logError';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const SettingsExperience = () => {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [currentWorkspaceMember, setCurrentWorkspaceMember] = useRecoilState(
    currentWorkspaceMemberState,
  );
  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });

  const updateCalendarStartDay = async () => {
    if (!currentWorkspaceMember?.id) {
      throw new Error('User is not logged in');
    }
    const changedFields = {
      isWeekStartMonday: !currentWorkspaceMember.isWeekStartMonday,
    };

    try {
      await updateOneRecord({
        idToUpdate: currentWorkspaceMember.id,
        updateOneRecordInput: changedFields,
      });

      setCurrentWorkspaceMember({
        ...currentWorkspaceMember,
        ...changedFields,
      });
    } catch (error) {
      logError(error);
    }
  };
  const { t } = useLingui();

  return (
    <SubMenuTopBarContainer
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
        <Section>
          <H2Title title={t`Appearance`} />
          <ColorSchemePicker
            value={colorScheme}
            onChange={setColorScheme}
            lightLabel={t`Light`}
            darkLabel={t`Dark`}
            systemLabel={t`System settings`}
          />
        </Section>
        <Section>
          <H2Title
            title={t`Date and time`}
            description={t`Configure how dates are displayed across the app`}
          />
          <DateTimeSettings />
        </Section>
        <Section>
          <Card rounded>
            <SettingsOptionCardContentToggle
              Icon={IconCalendarEvent}
              title={t`Start week on Monday`}
              description={t`This will change how all calendars in your app look`}
              checked={currentWorkspaceMember?.isWeekStartMonday ?? false}
              onChange={updateCalendarStartDay}
            />
          </Card>
        </Section>

        <Section>
          <H2Title
            title={t`Language`}
            description={t`Select your preferred language`}
          />
          <LocalePicker />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
