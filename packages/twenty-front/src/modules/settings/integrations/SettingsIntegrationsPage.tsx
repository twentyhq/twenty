import React from 'react';
import styled from '@linaria/react';

const PageContainer = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
  color: var(--text-primary);
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
`;

const Card = styled.div`
  background: var(--background-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--color-primary);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const IconWrapper = styled.div<{ $color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${({ $color }) => $color}15;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
`;

const CardTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
`;

const CardDescription = styled.p`
  font-size: 14px;
  color: var(--text-secondary);
  margin: 8px 0 16px;
  line-height: 1.5;
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const Tag = styled.span`
  background: var(--background-secondary);
  color: var(--text-secondary);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
`;

const StatusBadge = styled.span<{ $connected: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background: ${({ $connected }) => $connected ? '#10B98115' : '#6B728015'};
  color: ${({ $connected }) => $connected ? '#10B981' : '#6B7280'};

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }
`;

interface Integration {
  id: string;
  provider: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  features: string[];
  connected: boolean;
  status: 'active' | 'inactive' | 'error' | 'pending';
}

const mockIntegrations: Integration[] = [
  {
    id: '1',
    provider: 'WHATSAPP',
    name: 'WhatsApp',
    description: 'Envía mensajes por WhatsApp Business API',
    icon: '📱',
    color: '#25D366',
    features: ['Mensajería', 'Notificaciones'],
    connected: false,
    status: 'inactive',
  },
  {
    id: '2',
    provider: 'SLACK',
    name: 'Slack',
    description: 'Integración con Slack para notificaciones',
    icon: '💬',
    color: '#4A154B',
    features: ['Mensajería', 'Canales'],
    connected: false,
    status: 'inactive',
  },
  {
    id: '3',
    provider: 'NOTION',
    name: 'Notion',
    description: 'Conecta Notion para notas y databases',
    icon: '📝',
    color: '#000000',
    features: ['Notas', 'Bases de datos'],
    connected: false,
    status: 'inactive',
  },
  {
    id: '4',
    provider: 'MERCADO_PAGO',
    name: 'Mercado Pago',
    description: 'Pagos en línea para México',
    icon: '💳',
    color: '#009EE3',
    features: ['PIX', 'Tarjetas'],
    connected: false,
    status: 'inactive',
  },
  {
    id: '5',
    provider: 'TWILIO',
    name: 'Twilio',
    description: 'SMS y Voz para comunicaciones',
    icon: '📞',
    color: '#F22F46',
    features: ['SMS', 'Voz'],
    connected: false,
    status: 'inactive',
  },
  {
    id: '6',
    provider: 'HUBSPOT',
    name: 'HubSpot',
    description: 'CRM y marketing automation',
    icon: '📊',
    color: '#FF7A59',
    features: ['CRM', 'Marketing'],
    connected: false,
    status: 'inactive',
  },
  {
    id: '7',
    provider: 'LINEAR',
    name: 'Linear',
    description: 'Gestión de issues y proyectos',
    icon: '📋',
    color: '#5E6AD2',
    features: ['Issues', 'Proyectos'],
    connected: false,
    status: 'inactive',
  },
  {
    id: '8',
    provider: 'STRIPE',
    name: 'Stripe',
    description: 'Pagos internacionales',
    icon: '💵',
    color: '#635BFF',
    features: ['Pagos', 'Suscripciones'],
    connected: false,
    status: 'inactive',
  },
];

export const SettingsIntegrationsPage = () => {
  const handleConnect = (provider: string) => {
    console.log('Connect:', provider);
  };

  return (
    <PageContainer>
      <PageTitle>Integraciones</PageTitle>
      <Grid>
        {mockIntegrations.map((integration) => (
          <Card key={integration.id} onClick={() => handleConnect(integration.provider)}>
            <CardHeader>
              <IconWrapper $color={integration.color}>
                {integration.icon}
              </IconWrapper>
              <div style={{ flex: 1 }}>
                <CardTitle>{integration.name}</CardTitle>
                <StatusBadge $connected={integration.connected}>
                  {integration.connected ? 'Conectado' : 'No conectado'}
                </StatusBadge>
              </div>
            </CardHeader>
            <CardDescription>{integration.description}</CardDescription>
            <Tags>
              {integration.features.map((feature) => (
                <Tag key={feature}>{feature}</Tag>
              ))}
            </Tags>
          </Card>
        ))}
      </Grid>
    </PageContainer>
  );
};
