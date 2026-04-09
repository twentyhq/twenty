import { useLingui } from '@lingui/react/macro';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { getSettingsPath } from 'twenty-shared/utils';
import { SettingsPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { H2Title } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { IconCheckbox, IconUsers, IconPlus, IconCalendar, IconTarget, IconClock } from '@tabler/icons-react';
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

const ProjectList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ProjectItem = styled.div`
  background: ${themeCssVariables.background.primary};
  border-radius: 6px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-left: 3px solid #3B82F6;
`;

const ProjectInfo = styled.div`
  flex: 1;
`;

const ProjectName = styled.div`
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
`;

const ProjectMeta = styled.div`
  font-size: 12px;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  gap: 16px;
`;

const ProgressBar = styled.div<{ progress: number }>`
  width: 100px;
  height: 6px;
  background: ${themeCssVariables.background.tertiary};
  border-radius: 3px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ progress: number }>`
  width: ${({ progress }) => progress}%;
  height: 100%;
  background: ${({ progress }) => 
    progress >= 80 ? '#10B981' : 
    progress >= 50 ? '#F59E0B' : 
    '#3B82F6'};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: ${themeCssVariables.font.color.secondary};
`;

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  planning: { color: '#3B82F6', label: 'Planificación' },
  active: { color: '#10B981', label: 'Activo' },
  on_hold: { color: '#F59E0B', label: 'En Pausa' },
  completed: { color: '#6B7280', label: 'Completado' },
  cancelled: { color: '#EF4444', label: 'Cancelado' },
};

export const SettingsProjects = () => {
  const { t } = useLingui();

  const { records: projects, loading } = useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.Project,
    limit: 20,
    orderBy: [{ createdAt: 'DescNullsLast' }],
  });

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-CO');
  };

  return (
    <SubMenuTopBarContainer
      title={t`Proyectos`}
      links={[
        { children: t`Workspace`, href: getSettingsPath(SettingsPath.Workspace) },
        { children: t`Proyectos` },
      ]}
    >
      <StyledContainer>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <H2Title title={t`Gestión de Proyectos`} />
          <IconButton Icon={IconPlus} variant="primary" size="small" onClick={() => {}} />
        </div>

        <Grid>
          <Card accentColor="#3B82F6">
            <CardTitle>
              <IconCheckbox size={20} />
              {t`Proyectos`}
            </CardTitle>
            <CardDescription>
              {t`Gestiona tus proyectos y tareas`}
            </CardDescription>
          </Card>
          <Card accentColor="#10B981">
            <CardTitle>
              <IconUsers size={20} />
              {t`Equipo`}
            </CardTitle>
            <CardDescription>
              {t`Asigna tareas a tu equipo`}
            </CardDescription>
          </Card>
        </Grid>

        <H2Title title={t`Proyectos Recientes`} />
        
        {loading ? (
          <EmptyState>{t`Cargando...`}</EmptyState>
        ) : projects.length === 0 ? (
          <EmptyState>
            <IconCheckbox size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <div>{t`No hay proyectos`}</div>
            <div style={{ fontSize: '13px', marginTop: '8px' }}>
              {t`Crea tu primer proyecto`}
            </div>
          </EmptyState>
        ) : (
          <ProjectList>
            {projects.map((project: any) => {
              const status = STATUS_CONFIG[project.status] || STATUS_CONFIG.planning;
              
              return (
                <ProjectItem key={project.id}>
                  <ProjectInfo>
                    <ProjectName>{project.name || 'Sin nombre'}</ProjectName>
                    <ProjectMeta>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <IconCalendar size={12} />
                        {formatDate(project.startDate)}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <IconTarget size={12} />
                        {formatDate(project.dueDate)}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <IconClock size={12} />
                        {project.progress || 0}%
                      </span>
                    </ProjectMeta>
                  </ProjectInfo>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <ProgressBar progress={project.progress || 0}>
                      <ProgressFill progress={project.progress || 0} />
                    </ProgressBar>
                    <span>{status.label}</span>
                  </div>
                </ProjectItem>
              );
            })}
          </ProjectList>
        )}
      </StyledContainer>
    </SubMenuTopBarContainer>
  );
};
