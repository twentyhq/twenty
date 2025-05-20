/* eslint-disable no-restricted-imports */
import { useGetAllIssuersByWorkspace } from '@/settings/integrations/focus-nfe/hooks/useGetAllIssuersByWorkspace';
import { SettingsIntegration } from '@/settings/integrations/types/SettingsIntegration'; // Keep for integration prop if needed for logo/etc.
import { SettingsPath } from '@/types/SettingsPath';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconPencil, IconPlus } from '@tabler/icons-react'; // Using a generic store icon for issuer
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconButton } from 'twenty-ui/input';
import { Card, CardFooter } from 'twenty-ui/layout';
import { Issuer } from '~/types/Issuer';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

type SettingsIntegrationFocusNfeIssuersListCardProps = {
  integration: SettingsIntegration; // May not be strictly needed if issuer list is self-contained
};

const StyledSection = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.spacing(1)};
  display: flex;
  flex-direction: column;
`;

const StyledCard = styled(Card)`
  background: ${({ theme }) => theme.background.secondary};
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing(0)};
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledDiv = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledFooter = styled(CardFooter)`
  align-items: center;
  display: flex;
  padding: ${({ theme }) => theme.spacing(1)};
`;

const StyledButton = styled.button`
  align-items: center;
  background: ${({ theme }) => theme.background.primary};
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.secondary};
  gap: ${({ theme }) => theme.spacing(2)};
  padding: 0 ${({ theme }) => theme.spacing(1)};
  padding-left: ${({ theme }) => theme.spacing(2)};
  cursor: pointer;
  display: flex;
  flex: 1 0 0;
  height: ${({ theme }) => theme.spacing(8)};
  width: 100%;

  &:hover {
    background: ${({ theme }) => theme.background.transparent.light};
  }
`;

const StyledDatabaseLogo = styled.img`
  height: 20px;
  width: 20px;
`;

export const SettingsIntegrationFocusNfeIssuersListCard = ({
  integration,
}: SettingsIntegrationFocusNfeIssuersListCardProps) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const { issuers = [], refetchIssuers } = useGetAllIssuersByWorkspace();

  useEffect(() => {
    refetchIssuers();
  }, [refetchIssuers]);

  const handleEditIssuer = (issuerId: string) => {
    const path = getSettingsPath(
      SettingsPath.IntegrationFocusNfeEditIssuer,
    ).replace(':issuerId', issuerId);
    navigate(path);
  };

  // eslint-disable-next-line @nx/workspace-no-navigate-prefer-link
  const handleAddNewIssuer = () => {
    navigate(getSettingsPath(SettingsPath.IntegrationFocusNfeNewIssuer));
  };

  return (
    <>
      <StyledSection>
        {issuers.length > 0 && (
          <>
            {issuers.map((issuer: Issuer) => (
              <StyledCard key={issuer.id}>
                <StyledDiv>
                  <StyledDatabaseLogo
                    alt={issuer.name}
                    src={integration.from.image}
                  />
                  {issuer.name}
                </StyledDiv>
                <StyledDiv>
                  {/* Add status toggle here if issuers get a status field */}
                  <IconButton
                    onClick={() => handleEditIssuer(issuer.id)}
                    variant="tertiary"
                    size="medium"
                    Icon={IconPencil}
                    aria-label={`Edit ${issuer.name}`}
                  />
                </StyledDiv>
              </StyledCard>
            ))}
          </>
        )}
        <StyledFooter>
          {/* eslint-disable-next-line @nx/workspace-no-navigate-prefer-link */}
          <StyledButton onClick={handleAddNewIssuer}>
            <IconPlus size={theme.icon.size.md} />
            {'Add Issuer'}
          </StyledButton>
        </StyledFooter>
      </StyledSection>
    </>
  );
};
