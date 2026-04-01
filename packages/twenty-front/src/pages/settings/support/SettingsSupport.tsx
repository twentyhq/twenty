import { useTranslation } from 'react-i18next';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { getSettingsPath } from 'twenty-shared/utils';
import { SettingsPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { H2Title, Section, Badge, IconButton } from 'twenty-ui';
import styled from '@emotion/styled';
import { IconHeadset, IconTicket, IconPlus, IconCheck, IconClock, IconAlertTriangle } from '@tabler/icons-react';
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

const TicketList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TicketItem = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border-radius: 6px;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-left: 3px solid #3B82F6;
`;

const TicketInfo = styled.div`
  flex: 1;
`;

const TicketTitle = styled.div`
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 4px;
`;

const TicketMeta = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.font.color.secondary};
`;

const PriorityBadge = styled.span<{ priority?: string }>`
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  background: ${({ priority }) => 
    priority === 'high' ? '#FEE2E2' : 
    priority === 'medium' ? '#FEF3C7' : 
    '#D1FAE5'};
  color: ${({ priority }) => 
    priority === 'high' ? '#DC2626' : 
    priority === 'medium' ? '#D97706' : 
    '#059669'};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: ${({ theme }) => theme.font.color.secondary};
`;

const STATUS_CONFIG: Record<string, { color: string; label: string; variant: any }> = {
  open: { color: '#3B82F6', label: 'Abierto', variant: 'info' },
  in_progress: { color: '#F59E0B', label: 'En Progreso', variant: 'warning' },
  resolved: { color: '#10B981', label: 'Resuelto', variant: 'success' },
  closed: { color: '#6B7280', label: 'Cerrado', variant: 'neutral' },
};

const PRIORITY_CONFIG: Record<string, string> = {
  high: 'high',
  medium: 'medium',
  low: 'low',
};

export const SettingsSupport = () => {
  const { t } = useTranslation();

  const { records: tickets, loading } = useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.Ticket,
    limit: 20,
    orderBy: [{ createdAt: 'DESC' }],
  });

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-CO');
  };

  return (
    <SubMenuTopBarContainer
      title={t('Soporte')}
      links={[
        { children: t('Workspace'), href: getSettingsPath(SettingsPath.Workspace) },
        { children: t('Soporte') },
      ]}
    >
      <StyledContainer>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <H2Title title={t('Tickets de Soporte')} />
          <IconButton Icon={IconPlus} variant="primary" size="small" onClick={() => {}} />
        </div>
        
        <Grid>
          <Card accentColor="#3B82F6">
            <CardTitle>
              <IconHeadset size={20} style={{ marginRight: 8 }} />
              Centro de Ayuda
            </CardTitle>
            <CardDescription>Base de conocimientos y FAQs</CardDescription>
          </Card>
          <Card accentColor="#10B981">
            <CardTitle>
              <IconTicket size={20} style={{ marginRight: 8 }} />
              Tickets
            </CardTitle>
            <CardDescription>Gestiona tickets de soporte</CardDescription>
          </Card>
        </Grid>

        <H2Title title={t('Tickets Recientes')} />
        
        {loading ? (
          <EmptyState>{t('Cargando...')}</EmptyState>
        ) : tickets.length === 0 ? (
          <EmptyState>
            <IconTicket size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <div>{t('No hay tickets de soporte')}</div>
            <div style={{ fontSize: '13px', marginTop: '8px' }}>
              {t('Crea tu primer ticket')}
            </div>
          </EmptyState>
        ) : (
          <TicketList>
            {tickets.map((ticket: any) => {
              const status = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
              const priority = PRIORITY_CONFIG[ticket.priority] || 'low';
              
              return (
                <TicketItem key={ticket.id}>
                  <TicketInfo>
                    <TicketTitle>{ticket.name || 'Sin título'}</TicketTitle>
                    <TicketMeta>
                      {ticket.description?.substring(0, 80) || 'Sin descripción'}...
                      {' • '}{formatDate(ticket.createdAt)}
                    </TicketMeta>
                  </TicketInfo>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <PriorityBadge priority={priority}>
                      {ticket.priority || 'low'}
                    </PriorityBadge>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                </TicketItem>
              );
            })}
          </TicketList>
        )}
      </StyledContainer>
    </SubMenuTopBarContainer>
  );
};
