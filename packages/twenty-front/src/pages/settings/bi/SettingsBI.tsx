import { useTranslation } from 'react-i18next';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { getSettingsPath } from 'twenty-shared/utils';
import { SettingsPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { H2Title, IconButton, Badge } from 'twenty-ui';
import styled from '@emotion/styled';
import { IconChartBar, IconChartLine, IconPieChart, IconPlus, IconLayoutDashboard } from '@tabler/icons-react';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(8)};
  padding: ${({ theme }) => theme.spacing(8)};
  width: 100%;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CardDescription = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: 13px;
`;

const DashboardList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
`;

const DashboardCard = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border-radius: 8px;
  padding: 20px;
  border-left: 4px solid #3B82F6;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: ${({ theme }) => theme.color.blue};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const DashboardName = styled.div`
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 8px;
`;

const DashboardMeta = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.font.color.secondary};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: ${({ theme }) => theme.font.color.secondary};
`;

export const SettingsBI = () => {
  const { t } = useTranslation();

  const { records: dashboards, loading } = useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.Dashboard,
    limit: 20,
    orderBy: [{ createdAt: 'DESC' }],
  });

  return (
    <SubMenuTopBarContainer
      title={t('BI Analytics')}
      links={[
        { children: t('Workspace'), href: getSettingsPath(SettingsPath.Workspace) },
        { children: t('BI Analytics') },
      ]}
    >
      <StyledContainer>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <H2Title title={t('Dashboards')} />
          <IconButton Icon={IconPlus} variant="primary" size="small" onClick={() => {}} />
        </div>

        <Grid>
          <Card accentColor="#3B82F6">
            <CardTitle>
              <IconChartBar size={20} />
              {t('Ventas')}
            </CardTitle>
            <CardDescription>{t('Análisis de ventas')}</CardDescription>
          </Card>
          <Card accentColor="#10B981">
            <CardTitle>
              <IconChartLine size={20} />
              {t('Tendencias')}
            </CardTitle>
            <CardDescription>{t('Métricas de tendencia')}</CardDescription>
          </Card>
          <Card accentColor="#8B5CF6">
            <CardTitle>
              <IconPieChart size={20} />
              {t('Reportes')}
            </CardTitle>
            <CardDescription>{t('Reportes personalizados')}</CardDescription>
          </Card>
        </Grid>

        <H2Title title={t('Mis Dashboards')} />
        
        {loading ? (
          <EmptyState>{t('Cargando...')}</EmptyState>
        ) : dashboards.length === 0 ? (
          <EmptyState>
            <IconLayoutDashboard size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <div>{t('No hay dashboards')}</div>
            <div style={{ fontSize: '13px', marginTop: '8px' }}>
              {t('Crea tu primer dashboard')}
            </div>
          </EmptyState>
        ) : (
          <DashboardList>
            {dashboards.map((dashboard: any) => (
              <DashboardCard key={dashboard.id}>
                <DashboardName>{dashboard.title || 'Sin título'}</DashboardName>
                <DashboardMeta>
                  {t('Creado')}: {new Date(dashboard.createdAt).toLocaleDateString('es-CO')}
                </DashboardMeta>
              </DashboardCard>
            ))}
          </DashboardList>
        )}
      </StyledContainer>
    </SubMenuTopBarContainer>
  );
};
