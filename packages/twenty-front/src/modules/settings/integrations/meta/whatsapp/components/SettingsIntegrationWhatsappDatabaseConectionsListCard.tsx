/* eslint-disable @nx/workspace-no-navigate-prefer-link */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable unused-imports/no-unused-vars */
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useNavigate, useParams } from 'react-router-dom';

import { SettingsSelectStatusPill } from '@/settings/integrations/meta/components/SettingsSelectStatusPill';
import { useFindAllWhatsappIntegrations } from '@/settings/integrations/meta/whatsapp/hooks/useFindAllWhatsappIntegrations';
import { useToggleWhatsappIntegration } from '@/settings/integrations/meta/whatsapp/hooks/useToggleWhatsappIntegrationDisable';
import { SettingsIntegration } from '@/settings/integrations/types/SettingsIntegration';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useEffect, useState } from 'react';
// eslint-disable-next-line no-restricted-imports
import { IconPencil, IconPlus, IconPointFilled } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';
import { Card, CardFooter } from 'twenty-ui/layout';

type SettingsIntegrationWhatsappDatabaseConectionsListCardProps = {
  integration: SettingsIntegration;
};

enum ChangeType {
  DisableWhatsapp = 'DISABLE_WHATSAPP',
}

const StyledDatabaseLogoContainer = styled.div`
  align-items: center;
  display: flex;
  height: ${({ theme }) => theme.spacing(4)};
  justify-content: center;
  width: ${({ theme }) => theme.spacing(4)};
`;

const StyledDatabaseLogo = styled.img`
  height: 100%;
  width: 16px;
`;

const StyledRowRightContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
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

export const SettingsIntegrationWhatsappDatabaseConectionsListCard = ({
  integration,
}: SettingsIntegrationWhatsappDatabaseConectionsListCardProps) => {
  // const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const { databaseKey = '' } = useParams();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [changeType, setChangeType] = useState<ChangeType>();
  const [selectedIntegrationId, setSelectedIntegrationId] =
    useState<string>('');

  const { whatsappIntegrations = [], refetchWhatsapp } =
    useFindAllWhatsappIntegrations();
  const { toggleWhatsappIntegrationDisable } = useToggleWhatsappIntegration();

  useEffect(() => {
    refetchWhatsapp();
  }, [refetchWhatsapp]);

  const handleStatusIntegration = (integrationId: string) => {
    setChangeType(ChangeType.DisableWhatsapp);
    setSelectedIntegrationId(integrationId);
    setIsModalOpen(true);
  };

  const handleConfirmChange = () => {
    switch (changeType) {
      case ChangeType.DisableWhatsapp:
        toggleWhatsappIntegrationDisable(selectedIntegrationId);
        refetchWhatsapp();
        return;
      default:
        return;
    }
  };

  const handleEditIntegration = (integrationId: string) => {
    navigate(`/settings/integrations/whatsapp/${integrationId}/edit`);
  };

  return (
    <>
      <StyledIntegrationsSection>
        {whatsappIntegrations.length > 0 && (
          <>
            {whatsappIntegrations.map((whatsappIntegration) => (
              <StyledCard key={whatsappIntegration.id}>
                <StyledDiv>
                  <StyledDatabaseLogo
                    alt={whatsappIntegration.label}
                    src={integration.from.image}
                  />
                  {whatsappIntegration.label}
                </StyledDiv>
                <StyledDiv>
                  <SettingsSelectStatusPill
                    dropdownId={`integration-${whatsappIntegration.id}`}
                    options={[
                      {
                        Icon: IconPointFilled,
                        label: 'Active',
                        value: false,
                      },
                      {
                        Icon: IconPointFilled,
                        label: 'Deactive',
                        value: true,
                      },
                    ]}
                    value={whatsappIntegration.disabled}
                    onChange={(newValue) => {
                      if (whatsappIntegration.disabled !== newValue) {
                        handleStatusIntegration(whatsappIntegration.id);
                      }
                    }}
                  />
                  <IconButton
                    onClick={() =>
                      handleEditIntegration(whatsappIntegration.id)
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
      <ConfirmationModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        title={`Disable Inbox`}
        subtitle={
          <>{`This will disabled this inbox and all chat conversations.`}</>
        }
        onConfirmClick={handleConfirmChange}
        confirmButtonText="Continue"
      />
    </>
  );
};
