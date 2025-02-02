import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { Button, H2Title, IconPlus, Section, UndecoratedLink } from 'twenty-ui';

import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
import { useFindAllSectors } from '@/settings/service-center/sectors/hooks/useFindAllSectors';
import { useEffect } from 'react';
import { ServiceCenterSectors } from '@/settings/service-center/sectors/components/ServiceCenterSectors';

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
