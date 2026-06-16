import { Stack, Text } from '@mantine/core';
import { useCallback, useState } from 'react';
import { AgentHome } from '@/propel/components/runner/AgentHome';
import { BookingModal } from '@/propel/components/runner/BookingModal';
import { ManagerCenter } from '@/propel/components/runner/ManagerCenter';
import { RunnerDrawer } from '@/propel/components/runner/RunnerDrawer';
import { type HubPayload } from '@/propel/types/oneOnOne';

// Orchestrates the role-aware hub body: the manager command-center and/or the
// agent home (player-coach gets both), plus the two overlays the FE graduation
// unlocks for real — a booking Modal and the Runner Drawer. `onMutated` lets the
// page refetch the hub after a booking or a completed meeting.
type BookTarget = {
  agentId: string;
  manager: { id: string; label: string } | null;
  forLabel?: string | null;
} | null;

type RunTarget = { meetingId: string; title: string } | null;

export const HubView = ({
  payload,
  onMutated,
}: {
  payload: HubPayload;
  onMutated: () => void;
}) => {
  const [bookTarget, setBookTarget] = useState<BookTarget>(null);
  const [runTarget, setRunTarget] = useState<RunTarget>(null);

  const showManager =
    (payload.tier === 'MANAGER' || payload.tier === 'PLAYER_COACH') &&
    payload.manager != null;
  const showAgent = payload.agent != null;

  const openRun = useCallback((meetingId: string, title: string) => {
    setRunTarget({ meetingId, title });
  }, []);

  // Agent self-book: against the agent's own manager, for the acting member.
  const openAgentBook = useCallback(() => {
    if (payload.agent == null) return;
    setBookTarget({
      agentId: payload.me.id,
      manager: payload.agent.manager,
      forLabel: null,
    });
  }, [payload]);

  // Manager booking on behalf of a report: against the manager's OWN hours.
  const openBookAgent = useCallback(
    (agent: { id: string; label: string }) => {
      setBookTarget({
        agentId: agent.id,
        manager: { id: payload.me.id, label: payload.me.label },
        forLabel: agent.label,
      });
    },
    [payload],
  );

  const onManageTeam = useCallback(() => {
    // Team management lives in the one-on-one settings; the hero links there
    // rather than reimplementing the member multi-select sheet.
    window.location.assign('/settings/profile');
  }, []);

  return (
    <>
      <Stack gap="xl">
        {showAgent && payload.agent != null ? (
          <AgentHome
            agent={payload.agent}
            weekLabel={payload.me.weekLabel}
            onBook={openAgentBook}
            onRunMeeting={openRun}
          />
        ) : null}

        {showManager && payload.manager != null ? (
          <ManagerCenter
            block={payload.manager}
            onManageTeam={onManageTeam}
            onBookAgent={openBookAgent}
            onRunMeeting={openRun}
          />
        ) : null}

        {!showManager && !showAgent ? (
          <Text size="sm" c="dimmed">
            Nothing to show yet — once you own open leads or manage a team, your
            1:1 week appears here.
          </Text>
        ) : null}
      </Stack>

      <BookingModal
        agentId={bookTarget?.agentId ?? null}
        manager={bookTarget?.manager ?? null}
        forLabel={bookTarget?.forLabel}
        onClose={(booked) => {
          setBookTarget(null);
          if (booked) onMutated();
        }}
      />

      <RunnerDrawer
        meetingId={runTarget?.meetingId ?? null}
        title={runTarget?.title ?? '1:1 Runner'}
        onClose={(changed) => {
          setRunTarget(null);
          if (changed) onMutated();
        }}
      />
    </>
  );
};
