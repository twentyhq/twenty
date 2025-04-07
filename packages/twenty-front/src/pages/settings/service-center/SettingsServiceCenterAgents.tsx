import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { ServiceCenterTabs } from '@/settings/service-center/agents/components/ServiceCenterTab';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { H2Title, IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const SettingsServiceCenterAgents = () => {
  // const { t } = useTranslation();

  return (
    <SubMenuTopBarContainer
      title={'Agents'}
      actionButton={
        <UndecoratedLink
          to={getSettingsPath(SettingsPath.ServiceCenterNewAgent)}
        >
          <Button
            Icon={IconPlus}
            title={'Add Agents'}
            accent="blue"
            size="small"
          />
        </UndecoratedLink>
      }
      links={[
        {
          children: 'Service Center',
          href: getSettingsPath(SettingsPath.ServiceCenter),
        },
        { children: 'Agents' },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title title="" description={'Manage all agents here.'} />
          <ServiceCenterTabs />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
