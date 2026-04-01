import { useTranslation } from 'react-i18next';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { getSettingsPath } from 'twenty-shared/utils';
import { SettingsPath } from 'twenty-shared/types';
import { H2Title } from 'twenty-ui';
import styled from '@emotion/styled';
import { IconPackage, IconAlertTriangle } from '@tabler/icons-react';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(8)};
  padding: ${({ theme }) => theme.spacing(8)};
  width: 100%;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
`;

const Card = styled.div<{ accentColor?: string }>`
  background: ${({ theme }) => theme.background.secondary};
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
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: 13px;
`;

export const SettingsInventory = () => {
  const { t } = useTranslation();

  return (
    <SubMenuTopBarContainer
      title={t('Inventario')}
      links={[
        { children: t('Workspace'), href: getSettingsPath(SettingsPath.Workspace) },
        { children: t('Inventario') },
      ]}
    >
      <StyledContainer>
        <H2Title title={t('Gestión de Inventario')} />
        <Grid>
          <Card accentColor="#3B82F6">
            <CardTitle>
              <IconPackage size={20} style={{ marginRight: 8 }} />
              {t('Productos')}
            </CardTitle>
            <CardDescription>{t('Gestiona tu inventario de productos')}</CardDescription>
          </Card>
          <Card accentColor="#F59E0B">
            <CardTitle>
              <IconAlertTriangle size={20} style={{ marginRight: 8 }} />
              {t('Alertas')}
            </CardTitle>
            <CardDescription>{t('Alertas de stock bajo')}</CardDescription>
          </Card>
        </Grid>
      </StyledContainer>
    </SubMenuTopBarContainer>
  );
};
