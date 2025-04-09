/* eslint-disable no-restricted-imports */
/* eslint-disable @nx/workspace-no-navigate-prefer-link */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable unused-imports/no-unused-vars */
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { Card, CardFooter, IconButton } from 'twenty-ui';

import { useFindAllInterIntegrations } from '@/settings/integrations/inter/hooks/useFindAllInterIntegrations';
import { useToggleInterIntegration } from '@/settings/integrations/inter/hooks/useToggleInterIntegrationDisable';
import { SettingsIntegration } from '@/settings/integrations/types/SettingsIntegration';
import { useEffect } from 'react';
// eslint-disable-next-line no-restricted-imports
import { SettingsSelectStatusPill } from '@/settings/integrations/meta/components/SettingsSelectStatusPill';
import { IconPencil, IconPlus, IconPointFilled } from '@tabler/icons-react';

type SettingsIntegrationInterDatabaseConectionsListCardProps = {
  integration: SettingsIntegration;
};

const StyledDatabaseLogo = styled.img`
  height: 100%;
  width: 16px;
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

export const SettingsIntegrationInterDatabaseConectionsListCard = ({
  integration,
}: SettingsIntegrationInterDatabaseConectionsListCardProps) => {
  // const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();

  const { interIntegrations = [], refetchInter } =
    useFindAllInterIntegrations();
  const { toggleInterIntegrationDisable } = useToggleInterIntegration();

  useEffect(() => {
    refetchInter();
  }, [refetchInter]);

  const handleConfirmChange = (id: string) => {
    toggleInterIntegrationDisable(id);
    refetchInter();
  };

  const handleEditIntegration = (integrationId: string) => {
    navigate(`/settings/integrations/inter/${integrationId}/edit`);
  };

  return (
    <>
      <StyledIntegrationsSection>
        {interIntegrations.length > 0 && (
          <>
            {interIntegrations.map((interIntegrations) => (
              <StyledCard key={interIntegrations.id}>
                <StyledDiv>
                  <StyledDatabaseLogo
                    alt={interIntegrations.integrationName}
                    src={integration.from.image}
                  />
                  {interIntegrations.integrationName}
                </StyledDiv>
                <StyledDiv>
                  <SettingsSelectStatusPill
                    dropdownId={`integration-${interIntegrations.id}`}
                    options={[
                      {
                        Icon: IconPointFilled,
                        label: interIntegrations.status,
                        value:
                          interIntegrations.status === 'Active' ? false : true,
                      },
                    ]}
                    onChange={() => {
                      handleConfirmChange(interIntegrations.id);
                    }}
                  />
                  <IconButton
                    onClick={() => handleEditIntegration(interIntegrations.id)}
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
