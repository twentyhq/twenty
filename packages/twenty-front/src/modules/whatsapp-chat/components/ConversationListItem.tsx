import styled from '@emotion/styled';
import { useCallback, useState } from 'react';

import {
  IconArchive,
  IconPinned,
  IconPinnedOff,
} from 'twenty-ui/display';
import { type WaConversation } from '@/whatsapp-chat/types/WhatsAppTypes';

// ── Program colors ──────────────────────────────────────────────

const PROGRAM_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  JP: { bg: '#dbeafe', border: '#93c5fd', text: '#1d4ed8' },
  BPA: { bg: '#cffafe', border: '#67e8f9', text: '#0e7490' },
  BPE: { bg: '#e0e7ff', border: '#a5b4fc', text: '#4338ca' },
  CERT: { bg: '#d1fae5', border: '#6ee7b7', text: '#047857' },
  Alumni: { bg: '#f1f5f9', border: '#cbd5e1', text: '#475569' },
  Canceled: { bg: '#ffe4e6', border: '#fda4af', text: '#be123c' },
  Lead: { bg: '#f5f5f4', border: '#d6d3d1', text: '#78716c' },
};

// ── Pipeline step icons (SVG paths for SA/SENT/VIEW/SIGN) ──────

const PIPELINE_ICONS = {
  SA: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 4v16" /><path d="M17 4v16" /><path d="M19 4H9.5a4.5 4.5 0 0 0 0 9H13" />
    </svg>
  ),
  SENT: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  VIEW: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ),
  SIGN: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  ),
};

// ── Styled components ───────────────────────────────────────────

const StyledItem = styled.div<{ isSelected: boolean }>`
  background: ${({ isSelected }) =>
    isSelected ? '#EBF0FF' : 'transparent'};
  border-bottom: 1px solid #F3F4F6;
  border-left: 3px solid ${({ isSelected }) =>
    isSelected ? '#1A6CFF' : 'transparent'};
  border-radius: 0;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  padding: 10px 12px;
  transition: background 120ms ease, border-color 120ms ease;

  &:hover {
    background: ${({ isSelected }) =>
      isSelected ? '#EBF0FF' : '#F5F6FA'};
  }
`;

const StyledCompactRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const StyledAvatar = styled.div<{ isClient?: boolean }>`
  align-items: center;
  background: ${({ isClient }) =>
    isClient ? '#1A6CFF' : '#E5E7EB'};
  border: none;
  border-radius: 50%;
  color: ${({ isClient }) =>
    isClient ? '#FFFFFF' : '#374151'};
  display: flex;
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 600;
  height: 40px;
  justify-content: center;
  position: relative;
  width: 40px;
`;

const StyledContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  gap: 2px;
`;

const StyledTopRow = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledNameGroup = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1.5)};
  min-width: 0;
`;

const StyledName = styled.span<{ isUnread?: boolean }>`
  color: ${({ isUnread }) =>
    isUnread ? '#111827' : '#374151'};
  font-size: 14px;
  font-weight: ${({ isUnread }) =>
    isUnread ? 600 : 500};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledNeedsReplyDot = styled.div`
  background: #F59E0B;
  border-radius: 50%;
  flex-shrink: 0;
  height: 8px;
  width: 8px;
`;

const StyledRightGroup = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledProgramBadge = styled.span<{ bg: string; border: string; text: string }>`
  background: ${({ bg }) => bg};
  border: 1px solid ${({ border }) => border};
  border-radius: ${({ theme }) => theme.border.radius.pill};
  color: ${({ text }) => text};
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  padding: 3px 8px;
  white-space: nowrap;
`;

const StyledTimestamp = styled.span<{ isUnread?: boolean }>`
  color: ${({ isUnread }) =>
    isUnread ? '#1A6CFF' : '#9CA3AF'};
  flex-shrink: 0;
  font-size: 12px;
  white-space: nowrap;
`;

const StyledBottomRow = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledPreview = styled.span<{ isUnread?: boolean }>`
  color: ${({ isUnread }) =>
    isUnread ? '#374151' : '#6B7280'};
  font-size: 13px;
  font-weight: ${({ isUnread }) =>
    isUnread ? 500 : 400};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledBadges = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledUnreadDot = styled.div`
  background: #1A6CFF;
  border-radius: 50%;
  height: 8px;
  width: 8px;
`;

const StyledPinIcon = styled.div`
  color: #9CA3AF;
  display: flex;
`;

const StyledMessageCount = styled.span`
  background: #E5E7EB;
  border-radius: 10px;
  color: #6B7280;
  font-size: 10px;
  font-weight: 600;
  min-width: 20px;
  padding: 1px 6px;
  position: absolute;
  bottom: -4px;
  right: -4px;
  text-align: center;
`;

// ── Visual pipeline (circles + connecting lines) ────────────────

const StyledPipelineContainer = styled.div`
  align-items: center;
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  display: flex;
  gap: 0;
  justify-content: space-between;
  margin-top: 8px;
  padding: 10px 12px;
`;

const StyledPipelineStepWrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 1;
`;

const StyledPipelineCircle = styled.div<{ active: boolean }>`
  align-items: center;
  background: ${({ active }) => (active ? '#DCFCE7' : 'transparent')};
  border: 2px solid ${({ active }) =>
    active ? '#22C55E' : '#D1D5DB'};
  border-radius: 50%;
  color: ${({ active }) =>
    active ? '#22C55E' : '#D1D5DB'};
  display: flex;
  height: 36px;
  justify-content: center;
  width: 36px;
`;

const StyledPipelineLine = styled.div<{ active: boolean }>`
  background: ${({ active }) =>
    active ? '#22C55E' : '#E5E7EB'};
  flex: 1;
  height: 2px;
  margin-bottom: 20px;
`;

const StyledPipelineLabel = styled.span<{ active: boolean }>`
  color: ${({ active }) =>
    active ? '#22C55E' : '#9CA3AF'};
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
`;


// ── Compact pipeline (shown when not selected) ──────────────────

const StyledCompactPipeline = styled.div`
  align-items: center;
  display: flex;
  gap: 2px;
  margin-top: 1px;
`;

const StyledCompactStep = styled.div<{ active: boolean }>`
  background: ${({ active }) =>
    active ? '#DCFCE7' : '#F3F4F6'};
  border-radius: 2px;
  color: ${({ active }) =>
    active ? '#22C55E' : '#D1D5DB'};
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.03em;
  line-height: 1;
  padding: 2px 3px;
`;

// ── MOP stats row styles ────────────────────────────────────────

const StyledMetricsRow = styled.div`
  align-items: stretch;
  border-bottom: 1px solid #E5E7EB;
  border-top: 1px solid #E5E7EB;
  display: flex;
  margin-top: 8px;
`;

const StyledMetricItem = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  padding: 6px 2px;
`;

const StyledMetricIcon = styled.span`
  color: #9CA3AF;
  display: flex;
`;

const StyledMetricValue = styled.span`
  color: #111827;
  font-size: 11px;
  font-weight: 700;
`;

const StyledMetricLabel = styled.span`
  color: #9CA3AF;
  font-size: 8px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
`;

const StyledMopBanner = styled.div`
  background: #FEF3C7;
  border-radius: 4px;
  color: #92400E;
  font-size: 12px;
  margin-top: 6px;
  overflow: hidden;
  padding: 4px 6px;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

// ── MOP metric icons (SVG) ──────────────────────────────────────

const MOP_ICONS = {
  watch: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ),
  registered: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  active: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  call: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  events: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
};

// ── Context menu styles ─────────────────────────────────────────

const StyledContextOverlay = styled.div`
  bottom: 0;
  left: 0;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 100;
`;

const StyledContextMenu = styled.div<{ x: number; y: number }>`
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  left: ${({ x }) => x}px;
  min-width: 180px;
  padding: 4px;
  position: fixed;
  top: ${({ y }) => y}px;
  z-index: 101;
`;

const StyledContextMenuItem = styled.button`
  align-items: center;
  background: none;
  border: none;
  border-radius: 6px;
  color: #374151;
  cursor: pointer;
  display: flex;
  font-family: inherit;
  font-size: 13px;
  gap: 8px;
  padding: 6px 8px;
  text-align: left;
  width: 100%;

  &:hover {
    background: #F5F6F7;
  }
`;

const StyledMenuIconWrapper = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
`;

// ── Helpers ─────────────────────────────────────────────────────

const formatTimestamp = (isoString: string): string => {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  if (diffDays === 1) {
    return 'Yesterday';
  }

  if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  }

  return date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  });
};

const formatWatchTime = (minutes?: number): string => {
  if (!minutes) return '-';
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}h${mins}m` : `${hours}h`;
};

const getDaysAgo = (isoString?: string): string => {
  if (!isoString) return '-';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '-';
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1d';
  if (diffDays < 30) return `${diffDays}d`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}m`;
  const years = Math.floor(diffDays / 365);
  const remainingMonths = Math.floor((diffDays % 365) / 30);
  return remainingMonths > 0 ? `${years}y${remainingMonths}m` : `${years}y`;
};

const formatCallDuration = (seconds?: number): string => {
  if (!seconds) return '-';
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return remainMins > 0 ? `${hours}h${remainMins}m` : `${hours}h`;
};

const cleanMopName = (name?: string): string => {
  if (!name) return '';
  const parts = name.split(' — ');
  return parts[parts.length - 1];
};

const getInitials = (conversation: WaConversation): string => {
  const name = conversation.leadFullName || conversation.whatsappName;

  if (!name) {
    return conversation.leadPhoneNumber.slice(-2);
  }

  const parts = name.trim().split(/\s+/);

  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  return parts[0].slice(0, 2).toUpperCase();
};

// ── Sub-components ──────────────────────────────────────────────

const VisualPipeline = ({ conversation }: { conversation: WaConversation }) => {
  const steps = [
    { key: 'SA', active: !!conversation.completedStrukturanalyse },
    { key: 'SENT', active: !!conversation.contractSent },
    { key: 'VIEW', active: !!conversation.contractViewed },
    { key: 'SIGN', active: !!conversation.contractIsSigned },
  ] as const;

  return (
    <StyledPipelineContainer>
      {steps.map((step, i) => (
        <div key={step.key} style={{ display: 'contents' }}>
          {i > 0 && (
            <StyledPipelineLine active={step.active} />
          )}
          <StyledPipelineStepWrapper>
            <StyledPipelineCircle active={step.active}>
              {PIPELINE_ICONS[step.key]}
            </StyledPipelineCircle>
            <StyledPipelineLabel active={step.active}>
              {step.key}
            </StyledPipelineLabel>
          </StyledPipelineStepWrapper>
        </div>
      ))}
    </StyledPipelineContainer>
  );
};

// ── Component ───────────────────────────────────────────────────

type ConversationListItemProps = {
  conversation: WaConversation;
  isSelected: boolean;
  onClick: (id: string) => void;
  onTogglePin?: (id: string, isPinned: boolean) => void;
  onArchive?: (id: string) => void;
  onToggleRead?: (id: string, isUnread: boolean) => void;
};

export const ConversationListItem = ({
  conversation,
  isSelected,
  onClick,
  onTogglePin,
  onArchive,
  onToggleRead,
}: ConversationListItemProps) => {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const displayName =
    conversation.leadFullName ||
    conversation.whatsappName ||
    conversation.leadPhoneNumber;

  const previewPrefix = conversation.lastMessageFromAgent ? 'You: ' : '';

  const needsReply = !conversation.lastMessageFromAgent;

  const program = conversation.justusProgram;
  const duration = conversation.justusDuration;
  const programColor = program ? PROGRAM_COLORS[program] : undefined;

  const hasPipeline =
    conversation.completedStrukturanalyse !== undefined ||
    conversation.contractSent !== undefined ||
    conversation.contractViewed !== undefined ||
    conversation.contractIsSigned !== undefined;

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const x = Math.min(e.clientX, window.innerWidth - 200);
      const y = Math.min(e.clientY, window.innerHeight - 200);
      setContextMenu({ x, y });
    },
    [],
  );

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  return (
    <>
      <StyledItem
        isSelected={isSelected}
        onClick={() => onClick(conversation.id)}
        onContextMenu={handleContextMenu}
      >
        {/* ── Compact row (always visible) ── */}
        <StyledCompactRow>
          <StyledAvatar isClient={conversation.isClient}>
            {getInitials(conversation)}
            {(conversation.messageCount ?? 0) > 0 && (
              <StyledMessageCount>{conversation.messageCount}</StyledMessageCount>
            )}
          </StyledAvatar>

          <StyledContent>
            <StyledTopRow>
              <StyledNameGroup>
                <StyledName isUnread={conversation.isUnread || needsReply}>
                  {displayName}
                </StyledName>
                {needsReply && <StyledNeedsReplyDot />}
              </StyledNameGroup>
              <StyledRightGroup>
                {programColor && program && (
                  <StyledProgramBadge
                    bg={programColor.bg}
                    border={programColor.border}
                    text={programColor.text}
                  >
                    {program}
                    {duration ? ` ${duration}` : ''}
                  </StyledProgramBadge>
                )}
                <StyledTimestamp isUnread={conversation.isUnread}>
                  {formatTimestamp(conversation.lastMessageAt)}
                </StyledTimestamp>
              </StyledRightGroup>
            </StyledTopRow>

            <StyledBottomRow>
              <StyledPreview isUnread={conversation.isUnread}>
                {previewPrefix}
                {conversation.lastMessageBody}
              </StyledPreview>
              <StyledBadges>
                {conversation.isPinned && (
                  <StyledPinIcon>
                    <IconPinned size={14} />
                  </StyledPinIcon>
                )}
                {conversation.isUnread && <StyledUnreadDot />}
              </StyledBadges>
            </StyledBottomRow>

            {/* Compact pipeline badges (when not selected) */}
            {hasPipeline && !isSelected && (
              <StyledCompactPipeline>
                <StyledCompactStep active={!!conversation.completedStrukturanalyse}>
                  SA
                </StyledCompactStep>
                <StyledCompactStep active={!!conversation.contractSent}>
                  SENT
                </StyledCompactStep>
                <StyledCompactStep active={!!conversation.contractViewed}>
                  VIEW
                </StyledCompactStep>
                <StyledCompactStep active={!!conversation.contractIsSigned}>
                  SIGN
                </StyledCompactStep>
              </StyledCompactPipeline>
            )}
          </StyledContent>
        </StyledCompactRow>

        {/* ── Expanded section (selected only) ── */}
        {isSelected && (
          <>
            {/* MOP stats row */}
            {(conversation.mopCount != null || conversation.mopTotalWatchTimeMinutes != null) && (
              <StyledMetricsRow>
                <StyledMetricItem>
                  <StyledMetricIcon>{MOP_ICONS.watch}</StyledMetricIcon>
                  <StyledMetricValue>
                    {formatWatchTime(conversation.mopTotalWatchTimeMinutes)}
                  </StyledMetricValue>
                  <StyledMetricLabel>Watch</StyledMetricLabel>
                </StyledMetricItem>
                <StyledMetricItem>
                  <StyledMetricIcon>{MOP_ICONS.registered}</StyledMetricIcon>
                  <StyledMetricValue>
                    {getDaysAgo(conversation.mopFirstSignupDate)}
                  </StyledMetricValue>
                  <StyledMetricLabel>Registered</StyledMetricLabel>
                </StyledMetricItem>
                <StyledMetricItem>
                  <StyledMetricIcon>{MOP_ICONS.active}</StyledMetricIcon>
                  <StyledMetricValue>
                    {getDaysAgo(conversation.mopLastActivityDate)}
                  </StyledMetricValue>
                  <StyledMetricLabel>Active</StyledMetricLabel>
                </StyledMetricItem>
                <StyledMetricItem>
                  <StyledMetricIcon>{MOP_ICONS.call}</StyledMetricIcon>
                  <StyledMetricValue>
                    {formatCallDuration(conversation.mopLastCallDurationSeconds ?? undefined)}
                  </StyledMetricValue>
                  <StyledMetricLabel>Call</StyledMetricLabel>
                </StyledMetricItem>
                <StyledMetricItem>
                  <StyledMetricIcon>{MOP_ICONS.events}</StyledMetricIcon>
                  <StyledMetricValue>
                    {conversation.mopCount ?? '-'}
                  </StyledMetricValue>
                  <StyledMetricLabel>Events</StyledMetricLabel>
                </StyledMetricItem>
              </StyledMetricsRow>
            )}

            {/* Yellow MOP event banner */}
            {conversation.mopLatestOfferName && (
              <StyledMopBanner>
                📅 {cleanMopName(conversation.mopLatestOfferName)}
              </StyledMopBanner>
            )}

            {/* Visual pipeline (Foundry-style circles + lines) */}
            {hasPipeline && <VisualPipeline conversation={conversation} />}
          </>
        )}
      </StyledItem>

      {contextMenu && (
        <>
          <StyledContextOverlay onClick={closeContextMenu} />
          <StyledContextMenu x={contextMenu.x} y={contextMenu.y}>
            {onTogglePin && (
              <StyledContextMenuItem
                onClick={() => {
                  onTogglePin(conversation.id, !conversation.isPinned);
                  closeContextMenu();
                }}
              >
                <StyledMenuIconWrapper>
                  {conversation.isPinned ? (
                    <IconPinnedOff size={16} />
                  ) : (
                    <IconPinned size={16} />
                  )}
                </StyledMenuIconWrapper>
                {conversation.isPinned ? 'Unpin' : 'Pin conversation'}
              </StyledContextMenuItem>
            )}

            {onToggleRead && (
              <StyledContextMenuItem
                onClick={() => {
                  onToggleRead(
                    conversation.id,
                    !conversation.isUnread,
                  );
                  closeContextMenu();
                }}
              >
                <StyledMenuIconWrapper>
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: conversation.isUnread
                          ? 'transparent'
                          : 'currentColor',
                        border: conversation.isUnread
                          ? '2px solid currentColor'
                          : 'none',
                      }}
                    />
                  </div>
                </StyledMenuIconWrapper>
                {conversation.isUnread ? 'Mark as read' : 'Mark as unread'}
              </StyledContextMenuItem>
            )}

            {onArchive && (
              <StyledContextMenuItem
                onClick={() => {
                  onArchive(conversation.id);
                  closeContextMenu();
                }}
              >
                <StyledMenuIconWrapper>
                  <IconArchive size={16} />
                </StyledMenuIconWrapper>
                Archive
              </StyledContextMenuItem>
            )}
          </StyledContextMenu>
        </>
      )}
    </>
  );
};
