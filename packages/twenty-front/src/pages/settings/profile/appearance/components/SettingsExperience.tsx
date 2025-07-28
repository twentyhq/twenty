import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { DaySelect } from '@/ui/input/components/internal/day/DaySelect';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useColorScheme } from '@/ui/theme/hooks/useColorScheme';

import { Trans, useLingui } from '@lingui/react/macro';
import { isNumber } from '@tiptap/core';
import { useRecoilState } from 'recoil';
import { H2Title } from 'twenty-ui/display';
import { ColorSchemePicker } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
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
  const calendarDaysWeek = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  const allowedDaysWeek = ['Sunday', 'Monday', 'Saturday'].map((day) => {
    const foundIndexDay = calendarDaysWeek.indexOf(day);
    return { day, index: foundIndexDay };
  });

  const updateCalendarStartDay = async (index: number | string) => {
    if (!currentWorkspaceMember?.id) {
      throw new Error('User is not logged in');
    }
    if (!isNumber(index) || index > 6 || index < 0) return;
    const changedFields = {
      calendarStartDay: index ?? 0,
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
          <DaySelect
            label={t`Calendar start day`}
            selectedDayIndex={currentWorkspaceMember?.calendarStartDay ?? 0}
            onChange={(dayIndex) => updateCalendarStartDay(dayIndex)}
            dayList={allowedDaysWeek}
          />
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
