import { useTranslation } from 'react-i18next';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { getSettingsPath } from 'twenty-shared/utils';
import { SettingsPath } from 'twenty-shared/types';
import { H2Title } from 'twenty-ui';
import styled from '@emotion/styled';
import { IconChartBar, IconChartLine, IconPieChart } from '@tabler/icons-react';

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

const Card = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border-radius: 8px;
  padding: 20px;
  border-top: 3px solid #3B82F6;
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

export const SettingsBI = () => {
  const { t } = useTranslation();

  return (
    <SubMenuTopBarContainer
      title={t('BI Analytics')}
      links={[
        { children: t('Workspace'), href: getSettingsPath(SettingsPath.Workspace) },
        { children: t('BI Analytics') },
      ]}
    >
      <StyledContainer>
        <H2Title title={t('Dashboards')} />
        <Grid>
          <Card>
            <CardTitle>
              <IconChartBar size={20} style={{ marginRight: 8 }} />
              {t('Ventas')}
            </CardTitle>
            <CardDescription>{t('Análisis de ventas')}</CardDescription>
          </Card>
          <Card>
            <CardTitle>
              <IconChartLine size={20} style={{ marginRight: 8 }} />
              {t('Tendencias')}
            </CardTitle>
            <CardDescription>{t('Métricas de tendencia')}</CardDescription>
          </Card>
          <Card>
            <CardTitle>
              <IconPieChart size={20} style={{ marginRight: 8 }} />
              {t('Reportes')}
            </CardTitle>
            <CardDescription>{t('Reportes personalizados')}</CardDescription>
          </Card>
        </Grid>
      </StyledContainer>
    </SubMenuTopBarContainer>
  );
};
