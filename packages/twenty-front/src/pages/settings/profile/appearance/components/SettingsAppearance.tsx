import { ColorSchemePicker, H2Title, Section } from 'twenty-ui';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useColorScheme } from '@/ui/theme/hooks/useColorScheme';
import { useTranslation } from 'react-i18next';
import { DateTimeSettings } from '~/pages/settings/profile/appearance/components/DateTimeSettings';

export const SettingsAppearance = () => {
  const { colorScheme, setColorScheme } = useColorScheme();

  const { t } = useTranslation();

  return (
    <SubMenuTopBarContainer
      title={t('experience')}
      links={[
        {
          children: t('user'),
          href: getSettingsPagePath(SettingsPath.ProfilePage),
        },
        { children: t('experience') },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title title={t('appearance')} />
          <ColorSchemePicker 
            value={colorScheme} 
            onChange={setColorScheme} 
            labelsColorSchemePickerProps={{
              dark: t('dark'),
              light: t('light'),
              systemSettings: t('systemSettings')
            }} />
        </Section>
        <Section>
          <H2Title
            title={t('dateTime')}
            description={t('dateTimeDescription')}
          />
          <DateTimeSettings />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
