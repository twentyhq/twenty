import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { IconChevronRight } from 'twenty-ui';

import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { Status } from '@/ui/display/status/components/Status';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';

type SettingsIntegrationDatabaseConnectionsListCardProps = {
  databaseLogoUrl: string;
  connections: {
    id: string;
    key: string;
    name: string;
    tables: {
      name: string;
    }[];
  }[];
};

const StyledDatabaseLogoContainer = styled.div`
  align-items: center;
  display: flex;
  height: ${({ theme }) => theme.spacing(4)};
  justify-content: center;
  width: ${({ theme }) => theme.spacing(4)};
`;

const StyledDatabaseLogo = styled.img`
  height: 100%;
`;

const StyledRowRightContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const SettingsIntegrationDatabaseConnectionsListCard = ({
  databaseLogoUrl,
  connections,
}: SettingsIntegrationDatabaseConnectionsListCardProps) => {
  const navigate = useNavigate();

  return (
    <SettingsListCard
      items={connections}
      RowIcon={() => (
        <StyledDatabaseLogoContainer>
          <StyledDatabaseLogo alt="" src={databaseLogoUrl} />
        </StyledDatabaseLogoContainer>
      )}
      RowRightComponent={({ item: connection }) => (
        <StyledRowRightContainer>
          <Status
            color="green"
            text={
              connection.tables.length === 1
                ? `1 tracked table`
                : `${connection.tables.length} tracked tables`
            }
          />
          <LightIconButton Icon={IconChevronRight} accent="tertiary" />
        </StyledRowRightContainer>
      )}
      onRowClick={(connection) => navigate(`./${connection.key}`)}
      getItemLabel={(connection) => connection.name}
      hasFooter
      footerButtonLabel="Add connection"
      onFooterButtonClick={() => navigate('./new')}
    />
  );
};
