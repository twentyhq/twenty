import { styled } from '@linaria/atomic';

import { Incident, IncidentSeverity, IncidentStatus } from '../types/incidents.types';

type IncidentListProps = {
  incidents: Incident[];
  onIncidentClick?: (incidentId: string) => void;
};

const SEVERITY_COLORS: Record<IncidentSeverity, string> = {
  critical: '#dc2626',
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#3b82f6',
};

const STATUS_COLORS: Record<IncidentStatus, string> = {
  detected: '#ef4444',
  investigating: '#f59e0b',
  identified: '#8b5cf6',
  mitigating: '#3b82f6',
  resolved: '#22c55e',
  closed: '#6b7280',
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const IncidentCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  &:hover {
    background: #f9fafb;
  }
`;

const IncidentInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const IncidentTitle = styled.span`
  font-weight: 600;
  font-size: 14px;
`;

const IncidentMeta = styled.span`
  font-size: 12px;
  color: #6b7280;
`;

const BadgeRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const SeverityBadge = styled.span<{ color: string }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  color: white;
  background: ${(props) => props.color};
  text-transform: uppercase;
`;

const StatusBadge = styled.span<{ color: string }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  color: white;
  background: ${(props) => props.color};
`;

const Duration = styled.span`
  font-size: 11px;
  color: #6b7280;
  font-variant-numeric: tabular-nums;
`;

export const IncidentList = ({
  incidents,
  onIncidentClick,
}: IncidentListProps) => {
  const getDuration = (startedAt: string, resolvedAt: string | null) => {
    const start = new Date(startedAt).getTime();
    const end = resolvedAt !== null ? new Date(resolvedAt).getTime() : Date.now();
    const minutes = Math.floor((end - start) / 60000);

    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ${minutes % 60}m`;
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  };

  return (
    <Container>
      {incidents.map((incident) => (
        <IncidentCard
          key={incident.id}
          onClick={() => onIncidentClick?.(incident.id)}
        >
          <IncidentInfo>
            <IncidentTitle>{incident.title}</IncidentTitle>
            <IncidentMeta>
              {incident.assigneeName ?? 'Unassigned'} |{' '}
              {incident.impactedSystems.join(', ')}
            </IncidentMeta>
          </IncidentInfo>
          <BadgeRow>
            <Duration>
              {getDuration(incident.startedAt, incident.resolvedAt)}
            </Duration>
            <SeverityBadge color={SEVERITY_COLORS[incident.severity]}>
              {incident.severity}
            </SeverityBadge>
            <StatusBadge color={STATUS_COLORS[incident.status]}>
              {incident.status}
            </StatusBadge>
          </BadgeRow>
        </IncidentCard>
      ))}
    </Container>
  );
};
