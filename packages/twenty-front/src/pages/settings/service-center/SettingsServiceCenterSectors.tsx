import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';

import { ServiceCenterSectors } from '@/settings/service-center/sectors/components/ServiceCenterSectors';
import { useFindAllSectors } from '@/settings/service-center/sectors/hooks/useFindAllSectors';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useEffect } from 'react';
import { H2Title, IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const SettingsServiceCenterSectors = () => {
  // const { t } = useTranslation();

  const { sectors, refetch } = useFindAllSectors();

  useEffect(() => {
    refetch();
  }, []);

  return (
    <SubMenuTopBarContainer
      title={'Sectors'}
      actionButton={
        <UndecoratedLink
          to={getSettingsPath(SettingsPath.ServiceCenterNewSector)}
        >
          <Button
            Icon={IconPlus}
            title={'Add Sectors'}
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
        { children: 'Sectors' },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title title="" description={'Manage all sectors here.'} />
          <ServiceCenterSectors sectors={sectors} refetchSectors={refetch} />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
