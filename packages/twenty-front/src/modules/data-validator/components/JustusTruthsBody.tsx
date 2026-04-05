import { useCallback, useMemo, useState } from 'react';
import styled from '@emotion/styled';

import { JUSTUS_TRUTH_OBJECT_NAME_SINGULAR } from '@/data-validator/constants/JustusTruthObjectName.constants';
import { useJustusTruthObjectExists } from '@/data-validator/hooks/useJustusTruthObjectExists';
import { useJustusTruthQueue } from '@/data-validator/hooks/useJustusTruthQueue';
import { useJustusTruthStats } from '@/data-validator/hooks/useJustusTruthStats';
import { useKeyboardShortcuts } from '@/data-validator/hooks/useKeyboardShortcuts';
import { useReviewSession } from '@/data-validator/hooks/useReviewSession';
import {
  type ReviewAction,
  type ValidatorViewMode,
} from '@/data-validator/types/data-validator.types';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilStateV2';

import { JustusTruthsListMode } from './JustusTruthsListMode';
import { JustusTruthsReviewMode } from './JustusTruthsReviewMode';
import { KeyboardShortcutsOverlay } from './KeyboardShortcutsOverlay';
import { ReviewProgressBar } from './ReviewProgressBar';
import { TruthEditModal } from './TruthEditModal';
import { UndoToast } from './UndoToast';

// --- Styled Components ---

const StyledLoading = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  font-size: ${({ theme }) => theme.font.size.md};
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledError = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  font-size: ${({ theme }) => theme.font.size.md};
  color: #ef4444;
`;

const StyledBodyContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`;

// --- Gate Component ---

export const JustusTruthsBody = () => {
  const { exists, isLoading: metaLoading } = useJustusTruthObjectExists();

  if (metaLoading) return <StyledLoading>Loading...</StyledLoading>;
  if (!exists)
    return (
      <StyledError>
        tobJustusTruth object not found in this workspace.
      </StyledError>
    );

  return <JustusTruthsBodyContent />;
};

// --- Main Content ---

const JustusTruthsBodyContent = () => {
  const [viewMode, setViewMode] = useState<ValidatorViewMode>('review');
  const [editModalTruthId, setEditModalTruthId] = useState<string | null>(null);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [actionToast, setActionToast] = useState<{
    action: string;
    text: string;
  } | null>(null);

  const [currentMember] = useRecoilStateV2(currentWorkspaceMemberState);
  const { updateOneRecord } = useUpdateOneRecord();
  const queue = useJustusTruthQueue();
  const session = useReviewSession();
  const globalStats = useJustusTruthStats();

  const reviewerName = currentMember
    ? `${currentMember.name?.firstName ?? ''} ${currentMember.name?.lastName ?? ''}`.trim()
    : 'Unknown';

  const handleAction = useCallback(
    async (action: ReviewAction) => {
      const truth = queue.currentTruth;
      if (!truth) return;

      const previousState = {
        status: truth.status,
        approvedBy: truth.approvedBy,
        approvedAt: truth.approvedAt,
      };

      const statusMap: Record<ReviewAction, string> = {
        approve: 'approved',
        reject: 'deprecated',
        support: 'supported',
        skip: truth.status ?? 'candidate',
      };

      session.recordAction(action, truth, previousState);

      if (action !== 'skip') {
        try {
          await updateOneRecord({
            objectNameSingular: JUSTUS_TRUTH_OBJECT_NAME_SINGULAR,
            idToUpdate: truth.id,
            updateOneRecordInput: {
              status: statusMap[action],
              approvedBy: reviewerName,
              approvedAt: new Date().toISOString(),
            },
          });
        } catch {
          setActionToast({
            action: 'error',
            text: 'Failed to update — may have been reviewed already',
          });
          setTimeout(() => setActionToast(null), 4000);
        }
      }

      const label =
        action === 'approve'
          ? 'Approved'
          : action === 'reject'
            ? 'Rejected'
            : action === 'support'
              ? 'Supported'
              : 'Skipped';
      setActionToast({
        action,
        text: `${label}: "${truth.truthText.slice(0, 60)}..."`,
      });
      setTimeout(() => setActionToast(null), 4000);

      if (action === 'skip') {
        queue.skipToNext();
      } else {
        queue.removeCurrent();
      }
    },
    [queue, session, updateOneRecord, reviewerName],
  );

  const handleUndo = useCallback(async () => {
    const entry = session.undo();
    if (!entry) return;

    if (entry.action !== 'skip') {
      try {
        await updateOneRecord({
          objectNameSingular: JUSTUS_TRUTH_OBJECT_NAME_SINGULAR,
          idToUpdate: entry.truthId,
          updateOneRecordInput: {
            status: entry.previousStatus ?? 'candidate',
            approvedBy: entry.previousApprovedBy,
            approvedAt: entry.previousApprovedAt,
          },
        });
      } catch {
        setActionToast({
          action: 'error',
          text: 'Cannot undo — record was modified',
        });
        setTimeout(() => setActionToast(null), 4000);
        return;
      }
    }

    queue.restoreTruth(entry.record);
    setActionToast({
      action: 'undo',
      text: `Undid: "${entry.truthText.slice(0, 60)}..."`,
    });
    setTimeout(() => setActionToast(null), 4000);
  }, [session, updateOneRecord, queue]);

  const shortcutHandlers = useMemo(
    () => ({
      onApprove: () => handleAction('approve'),
      onReject: () => handleAction('reject'),
      onSkip: () => handleAction('skip'),
      onSupport: () => handleAction('support'),
      onEdit: () => {
        if (queue.currentTruth) setEditModalTruthId(queue.currentTruth.id);
      },
      onUndo: () => handleUndo(),
      onHelp: () => setShowKeyboardHelp((prev) => !prev),
    }),
    [handleAction, handleUndo, queue.currentTruth],
  );

  useKeyboardShortcuts(
    shortcutHandlers,
    viewMode === 'review' && !editModalTruthId && !showKeyboardHelp,
  );

  return (
    <StyledBodyContainer>
      <ReviewProgressBar
        reviewedCount={globalStats.reviewedCount}
        totalCount={globalStats.total}
        progressPercent={globalStats.progressPercent}
        streak={session.streak}
        viewMode={viewMode}
        onToggleViewMode={() =>
          setViewMode((v) => (v === 'review' ? 'list' : 'review'))
        }
      />
      {viewMode === 'review' ? (
        <JustusTruthsReviewMode
          currentTruth={queue.currentTruth}
          onAction={handleAction}
          loading={queue.loading}
          isEmpty={queue.isEmpty}
          sessionStats={session.stats}
          averageReviewTime={session.averageReviewTime}
          totalReviewed={session.totalReviewed}
        />
      ) : (
        <JustusTruthsListMode />
      )}
      {actionToast && (
        <UndoToast
          action={actionToast.action}
          text={actionToast.text}
          onUndo={session.canUndo ? handleUndo : undefined}
          onDismiss={() => setActionToast(null)}
        />
      )}
      {editModalTruthId && queue.currentTruth && (
        <TruthEditModal
          truth={queue.currentTruth}
          onClose={() => setEditModalTruthId(null)}
          onSaved={() => setEditModalTruthId(null)}
        />
      )}
      {showKeyboardHelp && (
        <KeyboardShortcutsOverlay
          onClose={() => setShowKeyboardHelp(false)}
        />
      )}
    </StyledBodyContainer>
  );
};
