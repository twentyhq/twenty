import styled from '@emotion/styled';
import { useCallback, useRef, useState } from 'react';

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

const StyledOwnerLine = styled.span`
  color: #9CA3AF;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
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

// ── Component ───────────────────────────────────────────────────

type ChatHeaderProps = {
  conversation: WaConversation;
  messages?: WaMessage[];
  labels: WaLabel[];
  onAddLabel: (name: string, color: string) => Promise<unknown>;
  onRemoveLabel: (labelId: string) => void;
  onTogglePin?: (id: string, isPinned: boolean) => void;
  onArchive?: (id: string) => void;
  onToggleDetails?: () => void;
  onToggleSalesAngel?: () => void;
  showSalesAngel?: boolean;
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
  onAddLabel,
  onRemoveLabel,
  onTogglePin,
  onArchive,
  onToggleDetails,
  onToggleSalesAngel,
  showSalesAngel,
}: ChatHeaderProps) => {
  const [showPicker, setShowPicker] = useState(false);
  const addButtonRef = useRef<HTMLButtonElement>(null);

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

  const ownerName = conversation.assignedToName || 'Unassigned';
  const coachName = conversation.coachLeadOwnerName || 'None';

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
            <StyledOwnerLine>
              Owner: {ownerName} &middot; Coach: {coachName}
            </StyledOwnerLine>
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
