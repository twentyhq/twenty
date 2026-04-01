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
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
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

const formatSinceDate = (dateString: string | null): string | null => {
  if (!dateString) return null;
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return null;
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

  // Find most attended session type
  const sorted = Array.from(titleCounts.entries()).sort(
    (a, b) => b[1] - a[1],
  );
  const topSession = sorted[0];

  // Check recent sessions (last 30 days)
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
    return `Recently prioritized "${recentTop[0]}" (${recentTop[1]}x in last 30 days). Most attended overall: "${topSession[0]}" (${topSession[1]}x total)`;
  }

  return `Most attended session type: "${topSession[0]}" (${topSession[1]}x)`;
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
    return 'Loading overview...';
  }

  const parts: string[] = [];

  // Registration
  const since = formatSinceDate(registeredDate);
  if (since) {
    parts.push(`Active customer since ${since}`);
  } else {
    parts.push('Customer');
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
      `${activeSubs.length} active subscription${activeSubs.length > 1 ? 's' : ''}${programText}`,
    );
  } else if (subscriptions.length > 0) {
    parts.push(
      `${subscriptions.length} subscription${subscriptions.length > 1 ? 's' : ''} (none active)`,
    );
  } else {
    parts.push('No subscriptions');
  }

  // Sessions + type analysis
  if (sessions.length > 0) {
    parts.push(
      `${sessions.length} session${sessions.length > 1 ? 's' : ''} attended`,
    );
    const sessionInsight = analyzeSessionTypes(sessions);
    if (sessionInsight) {
      parts.push(sessionInsight);
    }
  } else {
    parts.push('No sessions recorded');
  }

  // Tickets
  const openTickets = tickets.filter(
    (t) =>
      String(t.status ?? '').toLowerCase() !== 'resolved' &&
      String(t.status ?? '').toLowerCase() !== 'closed',
  );
  if (openTickets.length > 0) {
    parts.push(
      `${openTickets.length} open ticket${openTickets.length > 1 ? 's' : ''}`,
    );
  } else {
    parts.push('No open tickets');
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

  return (
    <StyledOverviewCard>
      <StyledIconContainer>
        <IconSparkles size={20} />
      </StyledIconContainer>
      <StyledOverviewContent>
        <StyledOverviewTitle>Overview</StyledOverviewTitle>
        <StyledOverviewText>{summary}</StyledOverviewText>
      </StyledOverviewContent>
    </StyledOverviewCard>
  );
};
