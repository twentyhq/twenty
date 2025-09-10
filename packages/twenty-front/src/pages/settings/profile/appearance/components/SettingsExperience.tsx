import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useColorScheme } from '@/ui/theme/hooks/useColorScheme';
import { SettingsPath } from 'twenty-shared/types';
import type { NumberFormat } from '@/localization/constants/NumberFormat';
import { useRecoilState } from 'recoil';
import { dateTimeFormatState } from '@/localization/states/dateTimeFormatState';

import { Trans, useLingui } from '@lingui/react/macro';
import { getSettingsPath } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/display';
import { ColorSchemePicker } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { DateTimeSettings } from '~/pages/settings/profile/appearance/components/DateTimeSettings';
import { LocalePicker } from '~/pages/settings/profile/appearance/components/LocalePicker';
import { NumberFormatSelect } from '~/pages/settings/profile/appearance/components/NumberFormatSettings';

export const SettingsExperience = () => {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [dateTimeFormat, setDateTimeFormat] =
    useRecoilState(dateTimeFormatState);

  const { t } = useLingui();

  const handleNumberFormatChange = (value: NumberFormat) => {
    setDateTimeFormat((prev) => ({
      ...prev,
      numberFormat: value,
    }));
  };

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
            title={t`Language`}
            description={t`Select your preferred language`}
          />
          <LocalePicker />
        </Section>

        <Section>
          <H2Title
            title={t`Date and time`}
            description={t`Configure how dates are displayed across the app`}
          />
          <DateTimeSettings />
        </Section>

        <Section>
          <H2Title
            title={t`Other format`}
            description={t`Choose additional formatting preferences`}
          />
          <NumberFormatSelect
            value={dateTimeFormat.numberFormat}
            onChange={handleNumberFormatChange}
          />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
