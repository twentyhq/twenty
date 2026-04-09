import { useLingui } from '@lingui/react/macro';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { getSettingsPath } from 'twenty-shared/utils';
import { SettingsPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { H2Title } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { IconTrophy, IconStar, IconPlus, IconTarget, IconMedal } from '@tabler/icons-react';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['8']};
  padding: ${themeCssVariables.spacing['8']};
  width: 100%;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
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
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CardDescription = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: 13px;
`;

const SectionTitle = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: ${themeCssVariables.font.color.primary};
  margin-bottom: 12px;
`;

const BadgeList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const BadgeItem = styled.div`
  background: ${themeCssVariables.background.secondary};
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 200px;
`;

const BadgeIcon = styled.div<{ color?: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ color }) => color ?? '#F59E0B'}20;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ color }) => color ?? '#F59E0B'};
`;

const BadgeInfo = styled.div``;

const BadgeName = styled.div`
  font-weight: 600;
  font-size: 14px;
`;

const BadgeDesc = styled.div`
  font-size: 12px;
  color: ${themeCssVariables.font.color.secondary};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: ${themeCssVariables.font.color.secondary};
`;

export const SettingsGamification = () => {
  const { t } = useLingui();

  const { records: badges, loading: badgesLoading } = useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.Badge,
    limit: 20,
  });

  const { records: goals, loading: goalsLoading } = useFindManyRecords({
    objectNameSingular: 'goal' as any,
    limit: 20,
  });

  return (
    <SubMenuTopBarContainer
      title={t`Gamificación`}
      links={[
        { children: t`Workspace`, href: getSettingsPath(SettingsPath.Workspace) },
        { children: t`Gamificación` },
      ]}
    >
      <StyledContainer>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <H2Title title={t`Premio tu Equipo`} />
          <IconButton Icon={IconPlus} variant="primary" size="small" onClick={() => {}} />
        </div>

        <Grid>
          <Card accentColor="#F59E0B">
            <CardTitle>
              <IconTrophy size={20} />
              {t`Logros`}
            </CardTitle>
            <CardDescription>
              {t`Crea insignias y recompensas`}
            </CardDescription>
          </Card>
          <Card accentColor="#8B5CF6">
            <CardTitle>
              <IconStar size={20} />
              {t`Puntos`}
            </CardTitle>
            <CardDescription>
              {t`Sistema de puntos por desempeño`}
            </CardDescription>
          </Card>
        </Grid>

        <SectionTitle>{t`Insignias`}</SectionTitle>
        
        {badgesLoading ? (
          <EmptyState>{t`Cargando...`}</EmptyState>
        ) : badges.length === 0 ? (
          <EmptyState>
            <IconMedal size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <div>{t`No hay insignias creadas`}</div>
            <div style={{ fontSize: '13px', marginTop: '8px' }}>
              {t`Crea tu primera insignia`}
            </div>
          </EmptyState>
        ) : (
          <BadgeList>
            {badges.map((badge: any) => (
              <BadgeItem key={badge.id}>
                <BadgeIcon color={badge.color || '#F59E0B'}>
                  <IconMedal size={20} />
                </BadgeIcon>
                <BadgeInfo>
                  <BadgeName>{badge.name || 'Sin nombre'}</BadgeName>
                  <BadgeDesc>{badge.description || 'Sin descripción'}</BadgeDesc>
                </BadgeInfo>
              </BadgeItem>
            ))}
          </BadgeList>
        )}
      </StyledContainer>
    </SubMenuTopBarContainer>
  );
};
