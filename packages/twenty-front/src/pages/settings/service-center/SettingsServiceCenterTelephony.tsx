import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { H2Title, IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { ShowServiceCenterTelephonyTabs } from '~/pages/settings/service-center/SettingsServiceCenterShowTabs';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const SettingsServiceCenterTelephony = () => {
  return (
    <SubMenuTopBarContainer
      links={[]}
      // title="Settings"
    >
      <SettingsPageContainer>
        <SettingsHeaderContainer>
          <Breadcrumb
            links={[
              {
                children: 'Service Center',
              },
              { children: 'Telephony' },
            ]}
          />
          <UndecoratedLink
            to={getSettingsPath(
              SettingsPath.ServiceCenterNewTelephonyExtension,
            )}
          >
            <Button
              Icon={IconPlus}
              title={'Add Extension'}
              accent="blue"
              size="small"
            />
          </UndecoratedLink>
        </SettingsHeaderContainer>
        <Section>
          <H2Title title="" description={'Manage all extensions here.'} />
          <ShowServiceCenterTelephonyTabs />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
