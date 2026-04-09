import { useLingui } from '@lingui/react/macro';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { getSettingsPath } from 'twenty-shared/utils';
import { SettingsPath } from 'twenty-shared/types';
import { H2Title } from 'twenty-ui/display';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { IconApps, IconCreditCard, IconBrandSlack, IconShoppingCart } from '@tabler/icons-react';

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

const Card = styled.div<{ accentColor?: string }>`
  background: ${themeCssVariables.background.secondary};
  border-radius: 8px;
  padding: 20px;
  border-top: 3px solid ${({ accentColor }) => accentColor ?? '#3B82F6'};
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const CardTitle = styled.div`
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 8px;
`;

const CardDescription = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: 13px;
`;

export const SettingsMarketplace = () => {
  const { t } = useLingui();

  const apps = [
    { id: 'stripe', name: 'Stripe', description: 'Pagos online', icon: IconCreditCard, color: '#635BFF' },
    { id: 'slack', name: 'Slack', description: 'Notificaciones', icon: IconBrandSlack, color: '#4A154B' },
    { id: 'shopify', name: 'Shopify', description: 'E-commerce', icon: IconShoppingCart, color: '#96BF48' },
    { id: 'zapier', name: 'Zapier', description: 'Automatizaciones', icon: IconApps, color: '#FF4A00' },
  ];

  return (
    <SubMenuTopBarContainer
      title={t`Marketplace`}
      links={[
        { children: t`Workspace`, href: getSettingsPath(SettingsPath.Workspace) },
        { children: t`Marketplace` },
      ]}
    >
      <StyledContainer>
        <H2Title title={t`Integraciones Disponibles`} />
        <Grid>
          {apps.map((app) => (
            <Card key={app.id} accentColor={app.color}>
              <CardTitle>
                <app.icon size={20} style={{ marginRight: 8 }} />
                {app.name}
              </CardTitle>
              <CardDescription>{app.description}</CardDescription>
            </Card>
          ))}
        </Grid>
      </StyledContainer>
    </SubMenuTopBarContainer>
  );
};
