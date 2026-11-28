import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { SettingsApplicationConnectionCheckBanner } from '@/settings/applications/components/SettingsApplicationConnectionCheckBanner';
import { SettingsApplicationConnectionCheckEffect } from '@/settings/applications/components/SettingsApplicationConnectionCheckEffect';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledBanners = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};

  &:empty {
    display: none;
  }
`;

type SettingsApplicationConnectionChecksProps = {
  connections: Pick<ConnectedAccount, 'id' | 'authFailedAt' | 'archivedAt'>[];
  hasConnectionCheck: boolean;
};

export const SettingsApplicationConnectionChecks = ({
  connections,
  hasConnectionCheck,
}: SettingsApplicationConnectionChecksProps) => {
  if (!hasConnectionCheck) {
    return null;
  }

  const checkableConnections = connections.filter(
    (connection) =>
      !isDefined(connection.authFailedAt) && !isDefined(connection.archivedAt),
  );

  return (
    <>
      {checkableConnections.map((connection) => (
        <SettingsApplicationConnectionCheckEffect
          key={connection.id}
          connectedAccountId={connection.id}
        />
      ))}
      <StyledBanners>
        {checkableConnections.map((connection) => (
          <SettingsApplicationConnectionCheckBanner
            key={connection.id}
            connectedAccountId={connection.id}
          />
        ))}
      </StyledBanners>
    </>
  );
};
