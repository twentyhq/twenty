import styled from '@emotion/styled';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  IconArchive,
  IconCopy,
  IconPinned,
  IconPinnedOff,
  IconSparkles,
  IconUser,
} from 'twenty-ui/display';
import { type WaConversation, type WaLabel, type WaMessage } from '@/whatsapp-chat/types/WhatsAppTypes';
import { LabelBadge } from '@/whatsapp-chat/components/LabelBadge';
import { LabelPicker } from '@/whatsapp-chat/components/LabelPicker';
import { useProfilePicture } from '@/whatsapp-chat/hooks/useProfilePicture';

// ── Program colors (same as ConversationListItem) ───────────────

const PROGRAM_COLORS: Record<string, { bg: string; text: string }> = {
  JP: { bg: '#dbeafe', text: '#1d4ed8' },
  BPA: { bg: '#cffafe', text: '#0e7490' },
  BPE: { bg: '#e0e7ff', text: '#4338ca' },
  CERT: { bg: '#d1fae5', text: '#047857' },
  Alumni: { bg: '#f1f5f9', text: '#475569' },
  Canceled: { bg: '#ffe4e6', text: '#be123c' },
  Lead: { bg: '#f5f5f4', text: '#78716c' },
};

// ── Types ───────────────────────────────────────────────────────

export type WorkspaceMember = {
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatarUrl?: string | null;
};

// ── Styled components ───────────────────────────────────────────

const StyledContainer = styled.div`
  background: #FFFFFF;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const StyledTopRow = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(3)}
    0;
`;

const StyledLeft = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  min-width: 0;
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
  width: 40px;
`;

const StyledProfilePicture = styled.img`
  border-radius: 50%;
  height: 40px;
  flex-shrink: 0;
  object-fit: cover;
  width: 40px;
`;

const StyledInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const StyledName = styled.span`
  color: #111827;
  font-size: 15px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledPhoneRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1.5)};
`;

const StyledPhone = styled.span`
  color: #6B7280;
  font-size: 13px;
`;

const StyledProgramBadge = styled.span<{ bg: string; text: string }>`
  background: ${({ bg }) => bg};
  border-radius: 3px;
  color: ${({ text }) => text};
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.02em;
  line-height: 1;
  padding: 2px 5px;
  white-space: nowrap;
`;

const StyledRight = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledIconButton = styled.button`
  align-items: center;
  background: #F5F6F7;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  color: #6B7280;
  cursor: pointer;
  display: flex;
  height: 32px;
  justify-content: center;
  width: 32px;

  &:hover {
    background: #E5E7EB;
    border-color: #D1D5DB;
    color: #111827;
  }
`;

const StyledCloseButton = styled.a`
  align-items: center;
  background: none;
  border: 1px solid #1A6CFF;
  border-radius: 6px;
  color: #1A6CFF;
  cursor: pointer;
  display: inline-flex;
  font-family: inherit;
  font-size: 12px;
  font-weight: 500;
  gap: 4px;
  height: 32px;
  line-height: 1;
  padding: 0 12px;
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    background: #1A6CFF;
    color: #FFFFFF;
  }
`;

const StyledLabelsRow = styled.div`
  align-items: center;
  border-top: 1px solid #F3F4F6;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 8px 12px;
  position: relative;
`;

const StyledAngelButton = styled.button<{ active?: boolean }>`
  align-items: center;
  background: ${({ active }) => (active ? '#7c3aed' : '#F5F6F7')};
  border: 1px solid ${({ active }) => (active ? '#7c3aed' : '#E5E7EB')};
  border-radius: 6px;
  color: ${({ active }) => (active ? '#FFFFFF' : '#7c3aed')};
  cursor: pointer;
  display: flex;
  font-family: inherit;
  font-size: 12px;
  font-weight: 500;
  gap: 4px;
  height: 32px;
  padding: 0 10px;
  white-space: nowrap;

  &:hover {
    background: ${({ active }) => (active ? '#6d28d9' : '#ede9fe')};
    border-color: #7c3aed;
  }
`;

const StyledAddLabelButton = styled.button`
  align-items: center;
  background: none;
  border: 1px dashed #D1D5DB;
  border-radius: 12px;
  color: #9CA3AF;
  cursor: pointer;
  display: inline-flex;
  font-family: inherit;
  font-size: 11px;
  gap: 2px;
  line-height: 1;
  padding: 2px 8px;
  white-space: nowrap;

  &:hover {
    border-color: #1A6CFF;
    color: #1A6CFF;
  }
`;

// ── Assignment styled components ────────────────────────────────

const StyledAssignRow = styled.div`
  align-items: center;
  display: flex;
  gap: 6px;
  padding: 4px 12px 6px;
`;

const StyledAssignButton = styled.button<{ hasValue?: boolean; variant?: 'owner' | 'coach' }>`
  align-items: center;
  background: ${({ hasValue, variant }) =>
    hasValue
      ? variant === 'coach' ? '#f0fdf4' : '#fef2f2'
      : '#F9FAFB'};
  border: 1px solid ${({ hasValue, variant }) =>
    hasValue
      ? variant === 'coach' ? '#86efac' : '#fca5a5'
      : '#E5E7EB'};
  border-radius: 6px;
  color: ${({ hasValue, variant }) =>
    hasValue
      ? variant === 'coach' ? '#166534' : '#dc2626'
      : '#6B7280'};
  cursor: pointer;
  display: inline-flex;
  font-family: inherit;
  font-size: 12px;
  font-weight: 500;
  gap: 4px;
  height: 28px;
  padding: 0 10px;
  position: relative;
  white-space: nowrap;

  &:hover {
    border-color: ${({ variant }) =>
      variant === 'coach' ? '#22c55e' : '#ef4444'};
    opacity: 0.9;
  }
`;

const StyledDropdown = styled.div`
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  left: 0;
  max-height: 280px;
  min-width: 220px;
  overflow-y: auto;
  position: absolute;
  top: calc(100% + 4px);
  z-index: 100;
`;

const StyledDropdownHeader = styled.div`
  color: #9CA3AF;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.05em;
  padding: 8px 12px 4px;
  text-transform: uppercase;
`;

const StyledDropdownItem = styled.button<{ isActive?: boolean }>`
  align-items: center;
  background: ${({ isActive }) => (isActive ? '#F0F9FF' : 'transparent')};
  border: none;
  color: ${({ isActive }) => (isActive ? '#1A6CFF' : '#374151')};
  cursor: pointer;
  display: flex;
  font-family: inherit;
  font-size: 13px;
  font-weight: ${({ isActive }) => (isActive ? 500 : 400)};
  gap: 8px;
  padding: 6px 12px;
  text-align: left;
  width: 100%;

  &:hover {
    background: #F3F4F6;
  }
`;

const StyledDropdownSearch = styled.input`
  background: #F9FAFB;
  border: none;
  border-bottom: 1px solid #E5E7EB;
  color: #111827;
  font-family: inherit;
  font-size: 13px;
  outline: none;
  padding: 8px 12px;
  width: 100%;

  &::placeholder {
    color: #9CA3AF;
  }
`;

const StyledMemberInitials = styled.span`
  align-items: center;
  background: #E5E7EB;
  border-radius: 50%;
  color: #374151;
  display: inline-flex;
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 600;
  height: 22px;
  justify-content: center;
  width: 22px;
`;

// ── Component ───────────────────────────────────────────────────

type ChatHeaderProps = {
  conversation: WaConversation;
  messages?: WaMessage[];
  labels: WaLabel[];
  workspaceMembers: WorkspaceMember[];
  currentUserEmail?: string;
  onAddLabel: (name: string, color: string) => Promise<unknown>;
  onRemoveLabel: (labelId: string) => void;
  onTogglePin?: (id: string, isPinned: boolean) => void;
  onArchive?: (id: string) => void;
  onToggleDetails?: () => void;
  onToggleSalesAngel?: () => void;
  showSalesAngel?: boolean;
  onAssign?: (email: string, name: string) => void;
  onAssignCoach?: (email: string, name: string) => void;
};

const formatChatForClipboard = (
  conversation: WaConversation,
  messages: WaMessage[],
): string => {
  const contactName =
    conversation.leadFullName ||
    conversation.whatsappName ||
    conversation.leadPhoneNumber;

  const lines = messages
    .filter((m) => !m.isDeleted)
    .map((m) => {
      const time = new Date(m.messageTimestamp).toLocaleString();
      const sender = m.fromAgent ? 'Agent' : contactName;
      const body = m.body || (m.hasMedia ? '[Media]' : '[Empty]');
      return `[${time}] ${sender}: ${body}`;
    });

  return `Chat with ${contactName} (${conversation.leadPhoneNumber})\n${'─'.repeat(50)}\n${lines.join('\n')}`;
};

export const ChatHeader = ({
  conversation,
  messages,
  labels,
  workspaceMembers,
  currentUserEmail,
  onAddLabel,
  onRemoveLabel,
  onTogglePin,
  onArchive,
  onToggleDetails,
  onToggleSalesAngel,
  showSalesAngel,
  onAssign,
  onAssignCoach,
}: ChatHeaderProps) => {
  const [showPicker, setShowPicker] = useState(false);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const [showOwnerDropdown, setShowOwnerDropdown] = useState(false);
  const [showCoachDropdown, setShowCoachDropdown] = useState(false);
  const [assignSearch, setAssignSearch] = useState('');
  const ownerRef = useRef<HTMLDivElement>(null);
  const coachRef = useRef<HTMLDivElement>(null);

  const { pictureUrl } = useProfilePicture(
    conversation.sessionName,
    conversation.leadPhoneNumber,
  );

  const displayName =
    conversation.leadFullName ||
    conversation.whatsappName ||
    conversation.leadPhoneNumber;

  const showPhone = displayName !== conversation.leadPhoneNumber;

  const initials = displayName
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const program = conversation.justusProgram;
  const duration = conversation.justusDuration;
  const programColor = program ? PROGRAM_COLORS[program] : undefined;

  const ownerName = conversation.assignedToName || null;
  const ownerEmail = conversation.assignedToEmail || null;
  const coachName = conversation.coachLeadOwnerName || null;
  const coachEmail = conversation.coachLeadOwnerEmail || null;

  const handleTogglePin = useCallback(() => {
    onTogglePin?.(conversation.id, !conversation.isPinned);
  }, [conversation.id, conversation.isPinned, onTogglePin]);

  const handleArchive = useCallback(() => {
    onArchive?.(conversation.id);
  }, [conversation.id, onArchive]);

  const [copied, setCopied] = useState(false);
  const handleCopyChat = useCallback(() => {
    if (!messages || messages.length === 0) return;
    const text = formatChatForClipboard(conversation, messages);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [conversation, messages]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ownerRef.current && !ownerRef.current.contains(e.target as Node)) {
        setShowOwnerDropdown(false);
      }
      if (coachRef.current && !coachRef.current.contains(e.target as Node)) {
        setShowCoachDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Reset search when dropdown closes
  useEffect(() => {
    if (!showOwnerDropdown && !showCoachDropdown) setAssignSearch('');
  }, [showOwnerDropdown, showCoachDropdown]);

  const filteredMembers = workspaceMembers.filter((m) => {
    if (!assignSearch) return true;
    const q = assignSearch.toLowerCase();
    return m.fullName.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
  });

  const handleSelectOwner = useCallback(
    (member: WorkspaceMember) => {
      onAssign?.(member.email, member.fullName);
      setShowOwnerDropdown(false);
    },
    [onAssign],
  );

  const handleSelectCoach = useCallback(
    (member: WorkspaceMember) => {
      onAssignCoach?.(member.email, member.fullName);
      setShowCoachDropdown(false);
    },
    [onAssignCoach],
  );

  const memberInitials = (m: WorkspaceMember) =>
    m.fullName
      .split(/\s+/)
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?';

  const meFirst = currentUserEmail
    ? filteredMembers.sort((a, b) => {
        if (a.email === currentUserEmail) return -1;
        if (b.email === currentUserEmail) return 1;
        return 0;
      })
    : filteredMembers;

  return (
    <StyledContainer>
      <StyledTopRow>
        <StyledLeft>
          {pictureUrl ? (
            <StyledProfilePicture src={pictureUrl} alt={displayName} />
          ) : (
            <StyledAvatar isClient={conversation.isClient}>
              {initials || '?'}
            </StyledAvatar>
          )}
          <StyledInfo>
            <StyledName>{displayName}</StyledName>
            {showPhone && (
              <StyledPhoneRow>
                <StyledPhone>{conversation.leadPhoneNumber}</StyledPhone>
                {programColor && program && (
                  <StyledProgramBadge
                    bg={programColor.bg}
                    text={programColor.text}
                  >
                    {program}
                    {duration ? ` ${duration}` : ''}
                  </StyledProgramBadge>
                )}
              </StyledPhoneRow>
            )}
            {!showPhone && programColor && program && (
              <StyledPhoneRow>
                <StyledProgramBadge
                  bg={programColor.bg}
                  text={programColor.text}
                >
                  {program}
                  {duration ? ` ${duration}` : ''}
                </StyledProgramBadge>
              </StyledPhoneRow>
            )}
          </StyledInfo>
        </StyledLeft>
        <StyledRight>
          {onToggleSalesAngel && (
            <StyledAngelButton
              active={showSalesAngel}
              onClick={onToggleSalesAngel}
              title={showSalesAngel ? 'Hide Sales Angel' : 'Sales Angel'}
            >
              <IconSparkles size={16} />
              {showSalesAngel ? 'Close AI' : 'Sales Angel'}
            </StyledAngelButton>
          )}
          {conversation.closeLeadUrl && (
            <StyledCloseButton
              href={conversation.closeLeadUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Call in Close
            </StyledCloseButton>
          )}
          {messages && messages.length > 0 && (
            <StyledIconButton
              onClick={handleCopyChat}
              title={copied ? 'Copied!' : 'Copy chat'}
            >
              <IconCopy size={18} />
            </StyledIconButton>
          )}
          {onTogglePin && (
            <StyledIconButton onClick={handleTogglePin} title="Toggle pin">
              {conversation.isPinned ? (
                <IconPinnedOff size={18} />
              ) : (
                <IconPinned size={18} />
              )}
            </StyledIconButton>
          )}
          {onArchive && (
            <StyledIconButton onClick={handleArchive} title="Archive">
              <IconArchive size={18} />
            </StyledIconButton>
          )}
          {onToggleDetails && (
            <StyledIconButton
              onClick={onToggleDetails}
              title="Lead Assistant"
            >
              <IconUser size={18} />
            </StyledIconButton>
          )}
        </StyledRight>
      </StyledTopRow>

      {/* ── Assignment row ── */}
      <StyledAssignRow>
        <div ref={ownerRef} style={{ position: 'relative' }}>
          <StyledAssignButton
            hasValue={!!ownerName}
            variant="owner"
            onClick={() => {
              setShowCoachDropdown(false);
              setShowOwnerDropdown((p) => !p);
            }}
            title={ownerEmail ? `Owner: ${ownerName} (${ownerEmail})` : 'Assign owner'}
          >
            {ownerName
              ? `Owner: ${ownerName.split(' ')[0]}`
              : 'Owner'}
          </StyledAssignButton>
          {showOwnerDropdown && (
            <StyledDropdown>
              <StyledDropdownSearch
                placeholder="Search..."
                value={assignSearch}
                onChange={(e) => setAssignSearch(e.target.value)}
                autoFocus
              />
              <StyledDropdownHeader>Assign Owner</StyledDropdownHeader>
              {meFirst.map((m) => (
                <StyledDropdownItem
                  key={m.email}
                  isActive={m.email === ownerEmail}
                  onClick={() => handleSelectOwner(m)}
                >
                  <StyledMemberInitials>{memberInitials(m)}</StyledMemberInitials>
                  {m.fullName}
                  {m.email === currentUserEmail ? ' (Me)' : ''}
                </StyledDropdownItem>
              ))}
              {meFirst.length === 0 && (
                <StyledDropdownItem>No matches</StyledDropdownItem>
              )}
            </StyledDropdown>
          )}
        </div>

        <div ref={coachRef} style={{ position: 'relative' }}>
          <StyledAssignButton
            hasValue={!!coachName}
            variant="coach"
            onClick={() => {
              setShowOwnerDropdown(false);
              setShowCoachDropdown((p) => !p);
            }}
            title={coachEmail ? `Coach: ${coachName} (${coachEmail})` : 'Assign coach'}
          >
            {coachName
              ? `Coach: ${coachName.split(' ')[0]}`
              : 'Coach'}
          </StyledAssignButton>
          {showCoachDropdown && (
            <StyledDropdown>
              <StyledDropdownSearch
                placeholder="Search..."
                value={assignSearch}
                onChange={(e) => setAssignSearch(e.target.value)}
                autoFocus
              />
              <StyledDropdownHeader>Assign Coach</StyledDropdownHeader>
              {meFirst.map((m) => (
                <StyledDropdownItem
                  key={m.email}
                  isActive={m.email === coachEmail}
                  onClick={() => handleSelectCoach(m)}
                >
                  <StyledMemberInitials>{memberInitials(m)}</StyledMemberInitials>
                  {m.fullName}
                  {m.email === currentUserEmail ? ' (Me)' : ''}
                </StyledDropdownItem>
              ))}
              {meFirst.length === 0 && (
                <StyledDropdownItem>No matches</StyledDropdownItem>
              )}
            </StyledDropdown>
          )}
        </div>
      </StyledAssignRow>

      <StyledLabelsRow>
        {labels.map((label) => (
          <LabelBadge key={label.id} label={label} onRemove={onRemoveLabel} />
        ))}
        <div style={{ position: 'relative' }}>
          <StyledAddLabelButton
            ref={addButtonRef}
            onClick={() => setShowPicker(true)}
          >
            + Label
          </StyledAddLabelButton>
          {showPicker && (
            <LabelPicker
              existingLabels={labels}
              onAdd={onAddLabel}
              onClose={() => setShowPicker(false)}
            />
          )}
        </div>
      </StyledLabelsRow>
    </StyledContainer>
  );
};
