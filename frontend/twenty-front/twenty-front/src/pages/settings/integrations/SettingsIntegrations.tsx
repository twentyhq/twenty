import { useLingui } from '@lingui/react/macro';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { getSettingsPath } from 'twenty-shared/utils';
import { SettingsPath } from 'twenty-shared/types';
import { H2Title } from 'twenty-ui/display';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { IconBrandWhatsapp, IconBrandSlack, IconBrandNotion, IconCreditCard, IconBrandTelegram, IconUsers } from '@tabler/icons-react';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['8']};
  padding: ${themeCssVariables.spacing['8']};
  width: 100%;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
`;

const IntegrationCard = styled.div<{ accentColor?: string; isConnected?: boolean }>`
  background: ${themeCssVariables.background.secondary};
  border-radius: 8px;
  padding: 20px;
  border-top: 3px solid ${({ accentColor, isConnected }) => isConnected ? '#10B981' : (accentColor ?? '#3B82F6')};
  cursor: pointer;
  transition: transform 0.2s;
  position: relative;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const CardTitle = styled.div`
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CardDescription = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: 13px;
`;

const ConnectedBadge = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
`;

export const SettingsIntegrations = () => {
  const { t } = useLingui();

  const integrations = [
    { id: 'whatsapp', name: 'WhatsApp', description: 'Mensajería y automatización', icon: IconBrandWhatsapp, color: '#25D366', connected: false },
    { id: 'slack', name: 'Slack', description: 'Notificaciones en Slack', icon: IconBrandSlack, color: '#4A154B', connected: true },
    { id: 'notion', name: 'Notion', description: 'Sincronización de notas', icon: IconBrandNotion, color: '#000000', connected: false },
    { id: 'stripe', name: 'Mercado Pago', description: 'Pagos y facturación', icon: IconCreditCard, color: '#009EE3', connected: false },
    { id: 'telegram', name: 'Telegram', description: 'Bot de notificaciones', icon: IconBrandTelegram, color: '#0088CC', connected: false },
    { id: 'hubspot', name: 'HubSpot', description: 'CRM externo', icon: IconUsers, color: '#FF7A59', connected: false },
  ];

  return (
    <SubMenuTopBarContainer
      title={t`Integraciones`}
      links={[
        { children: t`Workspace`, href: getSettingsPath(SettingsPath.Workspace) },
        { children: t`Integraciones` },
      ]}
    >
      <StyledContainer>
        <H2Title title={t`Integraciones Conectadas`} />
        <Grid>
          {integrations.map((integration) => (
            <IntegrationCard 
              key={integration.id} 
              accentColor={integration.color}
              isConnected={integration.connected}
            >
              <ConnectedBadge>
                {integration.connected && (
                  <span>Conectado</span>
                )}
              </ConnectedBadge>
              <CardTitle>
                <integration.icon size={20} />
                {integration.name}
              </CardTitle>
              <CardDescription>{integration.description}</CardDescription>
            </IntegrationCard>
          ))}
        </Grid>
      </StyledContainer>
    </SubMenuTopBarContainer>
  );
};
