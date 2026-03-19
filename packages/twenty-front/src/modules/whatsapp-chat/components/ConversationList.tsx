import styled from '@emotion/styled';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { IconChevronDown } from 'twenty-ui/display';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { ConversationListItem } from '@/whatsapp-chat/components/ConversationListItem';
import {
  ConversationFilters,
  type AssignmentFilter,
  type NeedsReplyThreshold,
  type SegmentFilter,
  type SortOrder,
  type StateFilter,
} from '@/whatsapp-chat/components/ConversationFilters';
import { ConversationSearch } from '@/whatsapp-chat/components/ConversationSearch';
import { useConversations } from '@/whatsapp-chat/hooks/useConversations';
import {
  type WaConversation,
  type WaSession,
} from '@/whatsapp-chat/types/WhatsAppTypes';

const CLIENT_PROGRAMS = new Set(['JP', 'BPA', 'BPE', 'CERT']);

const NEEDS_REPLY_HOURS: Record<NeedsReplyThreshold, number> = {
  any: 0,
  '24h': 24,
  '48h': 48,
  '72h': 72,
};

const StyledContainer = styled.div`
  background: #E8EBF0;
  border-right: 1px solid #D1D5DB;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 380px;
  min-width: 380px;
`;

const StyledHeader = styled.div`
  background: #F0F2F5;
  border-bottom: 1px solid #D1D5DB;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(3)};
`;


const StyledList = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing(1)};
`;

const StyledSectionLabel = styled.div`
  color: #9CA3AF;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  padding: 8px 12px;
  text-transform: uppercase;
`;

const StyledLoadMore = styled.button`
  align-items: center;
  background: none;
  border: none;
  color: #1A6CFF;
  cursor: pointer;
  display: flex;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  gap: 4px;
  justify-content: center;
  padding: 8px;

  &:hover {
    opacity: 0.8;
  }
`;

const StyledEmptyState = styled.div`
  align-items: center;
  color: #9CA3AF;
  display: flex;
  flex: 1;
  font-size: 14px;
  justify-content: center;
  padding: 32px;
  text-align: center;
`;

const StyledLoading = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  flex: 1;
  font-size: ${({ theme }) => theme.font.size.sm};
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(4)};
`;

type ConversationListProps = {
  sessions: WaSession[];
  selectedConversationId: string | null;
  onSelectConversation: (conversation: WaConversation) => void;
  onConversationsLoaded?: (conversations: WaConversation[]) => void;
  onTogglePin?: (id: string, isPinned: boolean) => void;
  onArchive?: (id: string) => void;
  onToggleRead?: (id: string, isUnread: boolean) => void;
  sessionHeader?: React.ReactNode;
};

export const ConversationList = ({
  sessions,
  selectedConversationId,
  onSelectConversation,
  onConversationsLoaded,
  onTogglePin,
  onArchive,
  onToggleRead,
  sessionHeader,
}: ConversationListProps) => {
  const currentMember = useRecoilValueV2(currentWorkspaceMemberState);
  const currentUserEmail = currentMember?.userEmail ?? '';

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [stateFilter, setStateFilter] = useState<StateFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [showArchived, setShowArchived] = useState(false);
  const [assignmentFilter, setAssignmentFilter] =
    useState<AssignmentFilter>('all');
  const [segmentFilter, setSegmentFilter] = useState<SegmentFilter>('all');
  const [needsReplyThreshold, setNeedsReplyThreshold] =
    useState<NeedsReplyThreshold>('any');
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  const [selectedDurations, setSelectedDurations] = useState<string[]>([]);
  const [selectedMops, setSelectedMops] = useState<string[]>([]);
  const previousConversationsRef = useRef<WaConversation[]>([]);

  // Debounce search to avoid firing API calls on every keystroke
  useEffect(() => {
    if (!search) {
      setDebouncedSearch('');
      return;
    }
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset search when session changes
  const activeSessionName = sessions.length === 1 ? sessions[0].name : undefined;

  useEffect(() => {
    setSearch('');
    setDebouncedSearch('');
  }, [activeSessionName]);

  const { conversations, loading, error, hasMore, loadMore, refresh, updateConversation } = useConversations({
    session: activeSessionName,
    search: debouncedSearch || undefined,
    sort: sortOrder,
  });

  // Wrap onToggleRead to also update local conversation state
  const handleToggleRead = useCallback(
    (id: string, isUnread: boolean) => {
      updateConversation(id, { isUnread });
      onToggleRead?.(id, isUnread);
    },
    [updateConversation, onToggleRead],
  );

  if (
    onConversationsLoaded &&
    conversations !== previousConversationsRef.current
  ) {
    previousConversationsRef.current = conversations;
    onConversationsLoaded(conversations);
  }

  // Compute available filter values from loaded conversations
  const { availablePrograms, availableDurations, availableMops } = useMemo(() => {
    const programs = new Set<string>();
    const durations = new Set<string>();
    const mops = new Set<string>();

    for (const c of conversations) {
      if (c.justusProgram) programs.add(c.justusProgram);
      if (c.justusDuration) durations.add(c.justusDuration);
      if (c.mopLatestOfferName) mops.add(c.mopLatestOfferName);
    }

    return {
      availablePrograms: Array.from(programs).sort(),
      availableDurations: Array.from(durations).sort(),
      availableMops: Array.from(mops).sort(),
    };
  }, [conversations]);

  // Apply local filters
  const filteredConversations = useMemo(() => {
    let result = conversations;

    // Archive filter
    if (!showArchived) {
      result = result.filter((c) => !c.isArchived);
    } else {
      result = result.filter((c) => c.isArchived);
    }

    // Assignment filter
    if (assignmentFilter === 'me') {
      result = result.filter(
        (c) =>
          c.assignedToEmail === currentUserEmail ||
          c.coachLeadOwnerEmail === currentUserEmail,
      );
    } else if (assignmentFilter === 'unassigned') {
      result = result.filter(
        (c) => !c.assignedToEmail && !c.coachLeadOwnerEmail,
      );
    }

    // Segment filter — by default hide conversations with no CRM contact match
    if (segmentFilter === 'clients') {
      result = result.filter(
        (c) => c.isClient || CLIENT_PROGRAMS.has(c.justusProgram ?? ''),
      );
    } else if (segmentFilter === 'leads') {
      result = result.filter(
        (c) => !c.isClient && !CLIENT_PROGRAMS.has(c.justusProgram ?? ''),
      );
    } else if (activeSessionName !== 'john_doe') {
      // 'all': show CRM-matched contacts + any conversation with recent activity
      // (last 7 days) even without a CRM match
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      result = result.filter(
        (c) =>
          c.contactEmail ||
          c.justusProgram ||
          c.isClient ||
          new Date(c.lastMessageAt).getTime() > sevenDaysAgo,
      );
    }

    // State filter — unified unread logic (same as ConversationListItem)
    if (stateFilter === 'unread') {
      result = result.filter(
        (c) =>
          c.isUnread === true ||
          (c.isUnread == null && !c.lastMessageFromAgent),
      );
    } else if (stateFilter === 'needs_reply') {
      // Needs reply with time threshold: only conversations where lead sent last msg
      const thresholdHours = NEEDS_REPLY_HOURS[needsReplyThreshold];
      const now = Date.now();

      result = result.filter((c) => {
        if (c.lastMessageFromAgent) return false;
        if (thresholdHours === 0) return true;
        const lastAt = new Date(c.lastMessageAt).getTime();
        const hoursSince = (now - lastAt) / (1000 * 60 * 60);
        return hoursSince >= thresholdHours;
      });
    }

    // Program filter
    if (selectedPrograms.length > 0) {
      result = result.filter((c) =>
        selectedPrograms.includes(c.justusProgram ?? ''),
      );
    }

    // Duration filter
    if (selectedDurations.length > 0) {
      result = result.filter((c) =>
        selectedDurations.includes(c.justusDuration ?? ''),
      );
    }

    // MOP filter
    if (selectedMops.length > 0) {
      result = result.filter((c) =>
        selectedMops.includes(c.mopLatestOfferName ?? ''),
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      const aTime = new Date(a.lastMessageAt).getTime();
      const bTime = new Date(b.lastMessageAt).getTime();

      return sortOrder === 'newest' ? bTime - aTime : aTime - bTime;
    });

    return result;
  }, [
    conversations,
    stateFilter,
    sortOrder,
    showArchived,
    assignmentFilter,
    segmentFilter,
    needsReplyThreshold,
    selectedPrograms,
    selectedDurations,
    selectedMops,
    currentUserEmail,
  ]);

  const hasActiveFilters =
    assignmentFilter !== 'all' ||
    segmentFilter !== 'all' ||
    stateFilter !== 'all' ||
    selectedPrograms.length > 0 ||
    selectedDurations.length > 0 ||
    selectedMops.length > 0;

  const handleClearFilters = useCallback(() => {
    setAssignmentFilter('all');
    setSegmentFilter('all');
    setStateFilter('all');
    setNeedsReplyThreshold('any');
    setSelectedPrograms([]);
    setSelectedDurations([]);
    setSelectedMops([]);
  }, []);

  const pinnedConversations = filteredConversations.filter((c) => c.isPinned);
  const unpinnedConversations = filteredConversations.filter(
    (c) => !c.isPinned,
  );

  const handleClick = useCallback(
    (id: string) => {
      const conversation = conversations.find((c) => c.id === id);

      if (conversation) {
        onSelectConversation(conversation);
      }
    },
    [conversations, onSelectConversation],
  );

  return (
    <StyledContainer>
      {sessionHeader}
      <StyledHeader>
        <ConversationSearch value={search} onChange={setSearch} />
        <ConversationFilters
          stateFilter={stateFilter}
          onStateFilterChange={setStateFilter}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          showArchived={showArchived}
          onShowArchivedChange={setShowArchived}
          assignmentFilter={assignmentFilter}
          onAssignmentFilterChange={setAssignmentFilter}
          segmentFilter={segmentFilter}
          onSegmentFilterChange={setSegmentFilter}
          needsReplyThreshold={needsReplyThreshold}
          onNeedsReplyThresholdChange={setNeedsReplyThreshold}
          selectedPrograms={selectedPrograms}
          onSelectedProgramsChange={setSelectedPrograms}
          selectedDurations={selectedDurations}
          onSelectedDurationsChange={setSelectedDurations}
          selectedMops={selectedMops}
          onSelectedMopsChange={setSelectedMops}
          availablePrograms={availablePrograms}
          availableDurations={availableDurations}
          availableMops={availableMops}
          resultCount={filteredConversations.length}
          totalCount={conversations.length}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={handleClearFilters}
        />
      </StyledHeader>

      <StyledList>
        {loading && conversations.length === 0 && (
          <StyledLoading>Loading conversations...</StyledLoading>
        )}

        {!loading && error && conversations.length === 0 && (
          <StyledEmptyState>
            <div>Failed to load conversations</div>
            <button
              onClick={refresh}
              style={{
                marginTop: 8,
                padding: '6px 16px',
                border: '1px solid #D1D5DB',
                borderRadius: 6,
                background: 'white',
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              Retry
            </button>
          </StyledEmptyState>
        )}

        {!loading && !error && filteredConversations.length === 0 && (
          <StyledEmptyState>
            {search
              ? 'No conversations match your search'
              : hasActiveFilters
                ? 'No conversations match these filters'
                : showArchived
                  ? 'No archived conversations'
                  : 'No conversations yet'}
          </StyledEmptyState>
        )}

        {pinnedConversations.length > 0 && (
          <>
            <StyledSectionLabel>Pinned</StyledSectionLabel>
            {pinnedConversations.map((conversation) => (
              <ConversationListItem
                key={conversation.id}
                conversation={conversation}
                isSelected={conversation.id === selectedConversationId}
                onClick={handleClick}
                onTogglePin={onTogglePin}
                onArchive={onArchive}
                onToggleRead={handleToggleRead}
              />
            ))}
          </>
        )}

        {unpinnedConversations.length > 0 && (
          <>
            {pinnedConversations.length > 0 && (
              <StyledSectionLabel>All messages</StyledSectionLabel>
            )}
            {unpinnedConversations.map((conversation) => (
              <ConversationListItem
                key={conversation.id}
                conversation={conversation}
                isSelected={conversation.id === selectedConversationId}
                onClick={handleClick}
                onTogglePin={onTogglePin}
                onArchive={onArchive}
                onToggleRead={handleToggleRead}
              />
            ))}
          </>
        )}

        {hasMore && (
          <StyledLoadMore onClick={loadMore}>
            <IconChevronDown size={14} />
            Load more
          </StyledLoadMore>
        )}
      </StyledList>
    </StyledContainer>
  );
};
