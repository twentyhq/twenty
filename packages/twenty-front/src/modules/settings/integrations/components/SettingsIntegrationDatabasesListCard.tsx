import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';

import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { IconChevronRight } from '@/ui/display/icon';
import { Status } from '@/ui/display/status/components/Status';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';

type SettingsIntegrationDatabasesListCardProps = {
  integrationLogoUrl: string;
  databases: {
    id: string;
    key: string;
    name: string;
    tables: {
      name: string;
    }[];
  }[];
};

const StyledIntegrationLogoContainer = styled.div`
  align-items: center;
  display: flex;
  height: ${({ theme }) => theme.spacing(4)};
  justify-content: center;
  width: ${({ theme }) => theme.spacing(4)};
`;

const StyledIntegrationLogo = styled.img`
  height: 100%;
`;

const StyledRowRightContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const SettingsIntegrationDatabasesListCard = ({
  integrationLogoUrl,
  databases,
}: SettingsIntegrationDatabasesListCardProps) => {
  const navigate = useNavigate();

  return (
    <SettingsListCard
      items={databases}
      RowIcon={() => (
        <StyledIntegrationLogoContainer>
          <StyledIntegrationLogo alt="" src={integrationLogoUrl} />
        </StyledIntegrationLogoContainer>
      )}
      RowRightComponent={({ item: database }) => (
        <StyledRowRightContainer>
          <Status
            color="green"
            text={
              database.tables.length === 1
                ? `1 tracked table`
                : `${database.tables.length} tracked tables`
            }
          />
          <LightIconButton Icon={IconChevronRight} accent="tertiary" />
        </StyledRowRightContainer>
      )}
      onRowClick={(database) => navigate(`./${database.key}`)}
      getItemLabel={(database) => database.name}
      hasFooter
      footerButtonLabel="Add connection"
      onFooterButtonClick={() => navigate('./new')}
    />
  );
};
