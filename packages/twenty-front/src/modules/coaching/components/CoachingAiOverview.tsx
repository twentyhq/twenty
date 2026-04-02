import { useCoachingSessionParticipation } from '@/coaching/hooks/useCoachingSessionParticipation';
import { useCoachingTickets } from '@/coaching/hooks/useCoachingTickets';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import styled from '@emotion/styled';
import { IconSparkles } from 'twenty-ui/display';

type CoachingAiOverviewProps = {
  registeredDate: string | null;
  email: string | null;
  wpUserId: string | null;
  subscriptions: ObjectRecord[];
  subsLoading: boolean;
};

const StyledOverviewCard = styled.div`
  background: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-left: 3px solid ${({ theme }) => theme.color.blue};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(4)};
`;

const StyledIconContainer = styled.div`
  color: ${({ theme }) => theme.color.blue};
  flex-shrink: 0;
  margin-top: 2px;
`;

const StyledOverviewContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledOverviewTitle = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledOverviewText = styled.span`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.md};
  line-height: 1.5;
`;

const StyledRecentSessions = styled.div`
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  margin-top: ${({ theme }) => theme.spacing(1)};
  padding-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledSessionLabel = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledSessionItem = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledSessionDate = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  min-width: 100px;
`;

const formatSinceDate = (dateString: string | null): string | null => {
  if (!dateString) return null;
  try {
    return new Date(dateString).toLocaleDateString('de-DE', {
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return null;
  }
};

const formatSessionDate = (dateString: string | null): string => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return String(dateString);
  }
};

const analyzeSessionTypes = (sessions: ObjectRecord[]): string | null => {
  if (sessions.length === 0) return null;

  const titleCounts = new Map<string, number>();

  for (const session of sessions) {
    const title = String(session.sessionTitle ?? '').trim();
    if (title) {
      titleCounts.set(title, (titleCounts.get(title) ?? 0) + 1);
    }
  }

  if (titleCounts.size === 0) return null;

  const sorted = Array.from(titleCounts.entries()).sort(
    (a, b) => b[1] - a[1],
  );
  const topSession = sorted[0];

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentSessions = sessions.filter((s) => {
    const dt = s.sessionDatetime as string | null;
    return dt && new Date(dt) >= thirtyDaysAgo;
  });

  const recentTitleCounts = new Map<string, number>();
  for (const session of recentSessions) {
    const title = String(session.sessionTitle ?? '').trim();
    if (title) {
      recentTitleCounts.set(title, (recentTitleCounts.get(title) ?? 0) + 1);
    }
  }

  const recentSorted = Array.from(recentTitleCounts.entries()).sort(
    (a, b) => b[1] - a[1],
  );

  if (recentSorted.length > 0) {
    const recentTop = recentSorted[0];
    return `Zuletzt bevorzugt: "${recentTop[0]}" (${recentTop[1]}x in den letzten 30 Tagen). Insgesamt am häufigsten: "${topSession[0]}" (${topSession[1]}x)`;
  }

  return `Am häufigsten besuchter Session-Typ: "${topSession[0]}" (${topSession[1]}x)`;
};

const buildSummary = (
  registeredDate: string | null,
  subscriptions: ObjectRecord[],
  sessions: ObjectRecord[],
  tickets: ObjectRecord[],
  subsLoading: boolean,
  sessionsLoading: boolean,
  ticketsLoading: boolean,
): string => {
  if (subsLoading || sessionsLoading || ticketsLoading) {
    return 'Übersicht wird geladen...';
  }

  const parts: string[] = [];

  // Registration
  const since = formatSinceDate(registeredDate);
  if (since) {
    parts.push(`Aktiver Kunde seit ${since}`);
  } else {
    parts.push('Kunde');
  }

  // Subscriptions
  const activeSubs = subscriptions.filter(
    (s) =>
      String(s.subscriptionAppStatus ?? '').toLowerCase() === 'active' ||
      String(s.lifecycleStatus ?? '').toLowerCase() === 'active',
  );
  if (activeSubs.length > 0) {
    const programNames = activeSubs
      .map((s) => String(s.programName ?? ''))
      .filter(Boolean);
    const programText =
      programNames.length > 0 ? ` (${programNames.join(', ')})` : '';
    parts.push(
      `${activeSubs.length} aktives Abo${activeSubs.length > 1 ? 's' : ''}${programText}`,
    );
  } else if (subscriptions.length > 0) {
    parts.push(
      `${subscriptions.length} Abo${subscriptions.length > 1 ? 's' : ''} (keines aktiv)`,
    );
  } else {
    parts.push('Keine Abos');
  }

  // Sessions + type analysis
  if (sessions.length > 0) {
    parts.push(
      `${sessions.length} Session${sessions.length > 1 ? 's' : ''} teilgenommen`,
    );
    const sessionInsight = analyzeSessionTypes(sessions);
    if (sessionInsight) {
      parts.push(sessionInsight);
    }
  } else {
    parts.push('Keine Sessions erfasst');
  }

  // Tickets
  const openTickets = tickets.filter(
    (t) =>
      String(t.status ?? '').toLowerCase() !== 'resolved' &&
      String(t.status ?? '').toLowerCase() !== 'closed',
  );
  if (openTickets.length > 0) {
    parts.push(
      `${openTickets.length} offene${openTickets.length > 1 ? '' : 's'} Ticket${openTickets.length > 1 ? 's' : ''}`,
    );
  } else {
    parts.push('Keine offenen Tickets');
  }

  return parts.join('. ') + '.';
};

export const CoachingAiOverview = ({
  registeredDate,
  email,
  wpUserId,
  subscriptions,
  subsLoading,
}: CoachingAiOverviewProps) => {
  const { sessions, loading: sessionsLoading } =
    useCoachingSessionParticipation(email, wpUserId);
  const { tickets, loading: ticketsLoading } = useCoachingTickets(
    email,
    wpUserId,
  );

  const summary = buildSummary(
    registeredDate,
    subscriptions,
    sessions,
    tickets,
    subsLoading,
    sessionsLoading,
    ticketsLoading,
  );

  // Last 5 sessions (already sorted desc by date)
  const recentFive = sessions.slice(0, 5);

  return (
    <StyledOverviewCard>
      <StyledIconContainer>
        <IconSparkles size={20} />
      </StyledIconContainer>
      <StyledOverviewContent>
        <StyledOverviewTitle>Übersicht</StyledOverviewTitle>
        <StyledOverviewText>{summary}</StyledOverviewText>
        {recentFive.length > 0 && (
          <StyledRecentSessions>
            <StyledSessionLabel>Letzte 5 Sessions:</StyledSessionLabel>
            {recentFive.map((session) => {
              const title = String(session.sessionTitle ?? '').trim();
              const sessionId = String(session.sessionId ?? '').trim();
              const label = title || sessionId || '—';
              return (
                <StyledSessionItem key={session.id}>
                  <StyledSessionDate>
                    {formatSessionDate(
                      session.sessionDatetime as string | null,
                    )}
                  </StyledSessionDate>
                  {label}
                </StyledSessionItem>
              );
            })}
          </StyledRecentSessions>
        )}
      </StyledOverviewContent>
    </StyledOverviewCard>
  );
};
