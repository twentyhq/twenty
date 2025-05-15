import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { ServiceCenterServiceLevelAgreement } from '@/settings/service-center/service-level/components/ServiceCenterServiceLevelAgreement';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const SettingsServiceCenterServiceLevel = () => {
  return (
    <SubMenuTopBarContainer
      title={'Service Level Agreement'}
      links={[
        {
          children: 'Service Center',
          href: getSettingsPath(SettingsPath.ServiceCenter),
        },
        { children: 'Service Level Agreement' },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={''}
            description={'Manage all the service center settings here.'}
          />
          <ServiceCenterServiceLevelAgreement />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
