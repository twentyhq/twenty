/* eslint-disable no-restricted-imports */
import { useGetAllIssuersByWorkspace } from '@/settings/integrations/focus-nfe/hooks/useGetAllIssuersByWorkspace';
import { SettingsIntegration } from '@/settings/integrations/types/SettingsIntegration'; // Keep for integration prop if needed for logo/etc.
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconButton } from 'twenty-ui/input';
import { Card, CardFooter } from 'twenty-ui/layout';
// For navigation
import { IconPencil, IconPlus } from '@tabler/icons-react'; // Using a generic store icon for issuer
import { Issuer } from '~/types/Issuer';

// Prop type for this new component
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

// Placeholder for Issuer specific logo/icon styling if needed
// const StyledIssuerLogo = styled(IconBuildingStore)`
//   height: 100%;
//   width: 28px;
// `;

export const SettingsIntegrationFocusNfeIssuersListCard = ({
  integration, // Keep for now, might be useful for context or generic card styling
}: SettingsIntegrationFocusNfeIssuersListCardProps) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const {
    issuers = [],
    refetchIssuers,
    // loading, // Add if you want loading states
  } = useGetAllIssuersByWorkspace();

  useEffect(() => {
    refetchIssuers();
  }, [refetchIssuers]);

  const handleEditIssuer = (issuerId: string) => {
    // Define a new SettingsPath for editing an issuer if it doesn't exist
    // For now, just logging, will need a new route e.g., SettingsPath.IntegrationFocusNfeEditIssuer
    console.log('Navigate to edit issuer:', issuerId);
    // const path = getSettingsPath(SettingsPath.IntegrationFocusNfeEditIssuer).replace(':issuerId', issuerId);
    // navigate(path);
  };

  const handleAddNewIssuer = () => {
    // Define a new SettingsPath for adding an issuer
    // For now, just logging, will need a new route e.g., SettingsPath.IntegrationFocusNfeAddIssuer
    console.log('Navigate to add new issuer page');
    // navigate(getSettingsPath(SettingsPath.IntegrationFocusNfeAddIssuer));
    navigate('new-issuer'); // Example relative path
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
          <StyledButton onClick={handleAddNewIssuer}>
            <IconPlus size={theme.icon.size.md} />
            {'Add Issuer'}
          </StyledButton>
        </StyledFooter>
      </StyledSection>
    </>
  );
};
