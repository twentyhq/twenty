/* eslint-disable no-restricted-imports */
/* eslint-disable @nx/workspace-no-navigate-prefer-link */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable unused-imports/no-unused-vars */
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { IconButton } from 'twenty-ui/input';
import { Card, CardFooter } from 'twenty-ui/layout';

import { SettingsIntegration } from '@/settings/integrations/types/SettingsIntegration';
import { useEffect } from 'react';
// eslint-disable-next-line no-restricted-imports
import { SettingsIntegrationFocusNfeToggleStatusButton } from '@/settings/integrations/focus-nfe/components/SettingsIntegrationFocusNfeDatabaseToggleStatusButton';
import { useGetAllFocusNfeIntegrationsByWorkspace } from '@/settings/integrations/focus-nfe/hooks/useGetAllFocusNfeIntegrationByWorkspace';
import { useToggleFocusNfeIntegrationStatus } from '@/settings/integrations/focus-nfe/hooks/useToggleFocusNfeStatus';
import { SettingsPath } from '@/types/SettingsPath';
import { IconPencil, IconPlus } from '@tabler/icons-react';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

type SettingsIntegrationInterDatabaseConectionsListCardProps = {
  integration: SettingsIntegration;
};

const StyledDatabaseLogo = styled.img`
  height: 100%;
  width: 28px;
`;

const StyledIntegrationsSection = styled.div`
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

export const SettingsIntegrationFocusNfeConectionsListCard = ({
  integration,
}: SettingsIntegrationInterDatabaseConectionsListCardProps) => {
  // const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();

  const {
    focusNfeIntegrations = [],
    refetchFocusNfe,
    loading,
  } = useGetAllFocusNfeIntegrationsByWorkspace();
  const { toggleFocusNfeIntegrationStatus } =
    useToggleFocusNfeIntegrationStatus();

  useEffect(() => {
    refetchFocusNfe();
  }, [refetchFocusNfe]);

  const handleToggleStatus = async (id: string) => {
    await toggleFocusNfeIntegrationStatus(id);
    refetchFocusNfe();
  };

  const handleEditIntegration = (integrationId: string) => {
    const path = getSettingsPath(
      SettingsPath.IntegrationFocusNfeEditDatabaseConnection,
    ).replace(':connectionId', integrationId);

    navigate(path);
  };

  return (
    <>
      <StyledIntegrationsSection>
        {focusNfeIntegrations.length > 0 && (
          <>
            {focusNfeIntegrations.map((focusNfeIntegrations) => (
              <StyledCard key={focusNfeIntegrations.id}>
                <StyledDiv>
                  <StyledDatabaseLogo
                    alt={focusNfeIntegrations.integrationName}
                    src={integration.from.image}
                  />
                  {focusNfeIntegrations.integrationName}
                </StyledDiv>
                <StyledDiv>
                  <SettingsIntegrationFocusNfeToggleStatusButton
                    key={focusNfeIntegrations.id}
                    actualStatus={focusNfeIntegrations.status ?? 'inactive'}
                    onClick={() => handleToggleStatus(focusNfeIntegrations.id)}
                    disabled={loading}
                  />
                  <IconButton
                    onClick={() =>
                      handleEditIntegration(focusNfeIntegrations.id)
                    }
                    variant="tertiary"
                    size="medium"
                    Icon={IconPencil}
                  />
                </StyledDiv>
              </StyledCard>
            ))}
          </>
        )}
        <StyledFooter>
          <StyledButton onClick={() => navigate('new')}>
            <IconPlus size={theme.icon.size.md} />
            {'Add connection'}
          </StyledButton>
        </StyledFooter>
      </StyledIntegrationsSection>
    </>
  );
};
