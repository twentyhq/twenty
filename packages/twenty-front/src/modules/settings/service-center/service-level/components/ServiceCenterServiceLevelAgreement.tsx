import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import styled from '@emotion/styled';
import { useEffect } from 'react';

// eslint-disable-next-line @nx/enforce-module-boundaries
import WhatsappIcon from '/images/integrations/whatsapp-logo.svg';
// import MessengerIcon from '/images/integrations/messenger-logo.svg';
import { useFindAllWhatsappIntegrations } from '@/settings/integrations/meta/whatsapp/hooks/useFindAllWhatsappIntegrations';
import { SettingsPath } from '@/types/SettingsPath';
import { useNavigate } from 'react-router-dom';
import { H2Title, IconEdit } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const StyledShowServiceServiceLevel = styled.div<{ isMobile: boolean }>`
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  justify-content: start;
  width: 100%;
`;

const StyledSection = styled(Section)`
  margin-top: ${({ theme }) => theme.spacing(8)};
`;

const StyledDiv = styled(Section)`
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.spacing(1)};
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

const StyledContainer = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  display: flex;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing(0)};
  padding: ${({ theme }) => theme.spacing(3)};

  &:last-child {
    border-bottom: none;
  }

  & img {
    margin-right: ${({ theme }) => theme.spacing(2)};
  }
`;

const StyledInbox = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
`;

const StyledContent = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-left: ${({ theme }) => theme.spacing(3)};
  overflow: auto;
`;

const StyledPill = styled.div`
  background: ${({ theme }) => theme.background.tertiary};
  color: ${({ theme }) => theme.font.color.secondary};
  padding: 5px ${({ theme }) => theme.spacing(2)};
  border-radius: ${({ theme }) => theme.spacing(1)};
  margin-right: ${({ theme }) => theme.spacing(1)};
`;

export const ServiceCenterServiceLevelAgreement = () => {
  // const { t } = useTranslation();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const { whatsappIntegrations, refetchWhatsapp } =
    useFindAllWhatsappIntegrations();
  // const { messengerIntegrations, refetchMessenger } =
  //   useGetAllMessengerIntegrations();

  useEffect(() => {
    refetchWhatsapp();
  }, [refetchWhatsapp]);

  const waList = (whatsappIntegrations || []).filter(
    (integration) => integration.disabled !== true,
  );

  // const fbList = (messengerIntegrations || []).filter(
  //   (integration) => integration.disabled !== true,
  // );

  const handleEditAgent = (inboxName: string) => {
    const path = getSettingsPath(
      SettingsPath.ServiceCenterEditServiceLevel,
    ).replace(':slaSlug', inboxName);

    navigate(path);
  };

  return (
    <StyledShowServiceServiceLevel isMobile={isMobile}>
      <StyledSection>
        <H2Title title={'Service Level Agreement'} />

        <StyledDiv>
          {waList?.map((wa) => (
            <StyledContainer key={wa.id}>
              <StyledInbox>
                <img src={WhatsappIcon} alt="Whatsapp" />
                {wa.name}
              </StyledInbox>
              <StyledContent>
                <StyledPill>{wa.sla} min</StyledPill>
                <IconButton
                  Icon={IconEdit}
                  onClick={() => handleEditAgent(wa.id)}
                  accent="default"
                  variant="tertiary"
                />
              </StyledContent>
            </StyledContainer>
          ))}
          {/* {fbList?.map((fb) => (
            <StyledContainer key={fb.id}>
              <StyledInbox>
                <img src={MessengerIcon} alt="Messenger" />
                {fb.label}
              </StyledInbox>
              <StyledContent>
                <StyledPill>{fb.sla} min</StyledPill>
                <IconButton
                  Icon={IconEdit}
                  onClick={() => handleEditAgent(fb.id)}
                  accent="default"
                  variant="tertiary"
                />
              </StyledContent>
            </StyledContainer>
          ))} */}
        </StyledDiv>
      </StyledSection>
    </StyledShowServiceServiceLevel>
  );
};
