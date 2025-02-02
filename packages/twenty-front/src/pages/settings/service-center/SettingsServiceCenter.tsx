import { H2Title, Section } from 'twenty-ui';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsServiceCenterSection } from '@/settings/service-center/sectors/components/SettingsServiceCenterSection';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const SettingsServiceCenter = () => {
  return (
    <SubMenuTopBarContainer
      title={'Service Center'}
      links={[
        {
          children: 'Workspace',
          href: getSettingsPath(SettingsPath.Workspace),
        },
        { children: 'Service Center' },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={''}
            description={'Manage all agents and sectors here.'}
          />

          <SettingsServiceCenterSection></SettingsServiceCenterSection>
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
