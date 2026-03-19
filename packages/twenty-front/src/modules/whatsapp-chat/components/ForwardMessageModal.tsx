import styled from '@emotion/styled';
import { useCallback, useMemo, useState } from 'react';

import { type WaConversation, type WaMessage } from '@/whatsapp-chat/types/WhatsAppTypes';
import { useSuppressHotkeys } from '@/whatsapp-chat/hooks/useSuppressHotkeys';

// ── Types ───────────────────────────────────────────────────────

type LeadStatus = 'warm' | 'hot' | 'ready_to_buy';

type ForwardStep = 'select-conversation' | 'confirm-send';

type ForwardOptions = {
  status: LeadStatus;
  includeCrmLink: boolean;
  includeWhatsAppLink: boolean;
  includeOwner: boolean;
  includeProgram: boolean;
  programKey: string;
  includeWhyFlagged: boolean;
  whyFlagged: string;
};

// ── Styled components ───────────────────────────────────────────

const StyledOverlay = styled.div`
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  inset: 0;
  justify-content: center;
  position: fixed;
  z-index: 200;
`;

const StyledModal = styled.div`
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  max-height: 80vh;
  max-width: 480px;
  width: 90vw;
`;

const StyledHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  justify-content: space-between;
  padding: 16px 20px;
`;

const StyledHeaderTitle = styled.span`
  color: #111827;
  font-size: 16px;
  font-weight: 600;
`;

const StyledCloseBtn = styled.button`
  background: none;
  border: none;
  color: #9CA3AF;
  cursor: pointer;
  font-size: 20px;
  line-height: 1;
  padding: 4px;

  &:hover { color: #374151; }
`;

const StyledBody = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  padding: 16px 20px;
`;

const StyledSearchInput = styled.input`
  background: #F3F4F6;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  color: #111827;
  font-family: inherit;
  font-size: 14px;
  outline: none;
  padding: 10px 12px;
  width: 100%;

  &:focus { border-color: #1A6CFF; }
`;

const StyledConvItem = styled.button`
  align-items: center;
  background: none;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  gap: 10px;
  padding: 10px;
  text-align: left;
  width: 100%;

  &:hover { background: #F5F6F8; }
`;

const StyledConvAvatar = styled.div`
  align-items: center;
  background: #E5E7EB;
  border-radius: 50%;
  color: #374151;
  display: flex;
  font-size: 12px;
  font-weight: 600;
  height: 36px;
  justify-content: center;
  min-width: 36px;
  width: 36px;
`;

const StyledConvInfo = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
`;

const StyledConvName = styled.span`
  color: #111827;
  font-size: 14px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledConvPhone = styled.span`
  color: #9CA3AF;
  font-size: 12px;
`;

const StyledStatusRow = styled.div`
  display: flex;
  gap: 8px;
`;

const StyledStatusBtn = styled.button<{ isActive: boolean }>`
  background: ${({ isActive }) => (isActive ? '#EBF0FF' : '#F3F4F6')};
  border: 1px solid ${({ isActive }) => (isActive ? '#1A6CFF' : '#E5E7EB')};
  border-radius: 8px;
  color: ${({ isActive }) => (isActive ? '#1A6CFF' : '#6B7280')};
  cursor: pointer;
  flex: 1;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  padding: 8px;

  &:hover { opacity: 0.9; }
`;

const StyledOptionRow = styled.label`
  align-items: center;
  cursor: pointer;
  display: flex;
  gap: 8px;
`;

const StyledCheckbox = styled.input`
  accent-color: #1A6CFF;
  cursor: pointer;
  height: 16px;
  width: 16px;
`;

const StyledOptionLabel = styled.span`
  color: #374151;
  font-size: 13px;
`;

const StyledTextarea = styled.textarea`
  background: #F3F4F6;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  color: #111827;
  font-family: inherit;
  font-size: 13px;
  min-height: 60px;
  outline: none;
  padding: 8px;
  resize: vertical;
  width: 100%;

  &:focus { border-color: #1A6CFF; }
`;

const StyledPreview = styled.div`
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  color: #374151;
  font-size: 12px;
  line-height: 1.5;
  max-height: 160px;
  overflow-y: auto;
  padding: 10px;
  white-space: pre-wrap;
`;

const StyledPreviewLabel = styled.span`
  color: #9CA3AF;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
`;

const StyledFooter = styled.div`
  border-top: 1px solid #E5E7EB;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding: 12px 20px;
`;

const StyledBtn = styled.button<{ variant?: 'primary' | 'secondary' }>`
  background: ${({ variant }) =>
    variant === 'primary' ? '#1A6CFF' : '#F3F4F6'};
  border: 1px solid ${({ variant }) =>
    variant === 'primary' ? '#1A6CFF' : '#E5E7EB'};
  border-radius: 8px;
  color: ${({ variant }) =>
    variant === 'primary' ? '#FFFFFF' : '#374151'};
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  padding: 8px 16px;

  &:hover { opacity: 0.9; }
  &:disabled { cursor: not-allowed; opacity: 0.5; }
`;

const StyledSectionTitle = styled.span`
  color: #9CA3AF;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
`;

// ── Helpers ─────────────────────────────────────────────────────

const STATUS_OPTIONS: { key: LeadStatus; emoji: string; label: string }[] = [
  { key: 'warm', emoji: '🟡', label: 'Warm' },
  { key: 'hot', emoji: '🔥', label: 'Hot' },
  { key: 'ready_to_buy', emoji: '🎯', label: 'Ready' },
];

const buildForwardText = (
  message: WaMessage,
  sourceConv: WaConversation,
  options: ForwardOptions,
  flaggedBy: string,
): string => {
  const lines: string[] = [];

  // Status line
  const statusEmoji = STATUS_OPTIONS.find((s) => s.key === options.status)?.emoji ?? '';
  lines.push(`${statusEmoji} *Forwarded Lead — ${options.status.toUpperCase().replace('_', ' ')}*`);
  lines.push('');

  // Contact info
  lines.push(`*Name:* ${sourceConv.leadFullName || sourceConv.whatsappName || 'Unknown'}`);
  lines.push(`*Phone:* ${sourceConv.leadPhoneNumber}`);

  if (options.includeCrmLink) {
    lines.push(`*CRM:* https://crm.tob.sh/objects/waConversations/${sourceConv.id}`);
  }

  if (options.includeWhatsAppLink) {
    const phone = sourceConv.leadPhoneNumber.replace(/\+/g, '');
    lines.push(`*WhatsApp:* https://wa.me/${phone}`);
  }

  if (options.includeOwner && sourceConv.assignedToName) {
    lines.push(`*Owner:* ${sourceConv.assignedToName}`);
  }

  if (options.includeProgram && options.programKey) {
    lines.push(`*Program:* ${options.programKey}`);
  }

  lines.push(`*Flagged by:* ${flaggedBy}`);

  if (options.includeWhyFlagged && options.whyFlagged.trim()) {
    lines.push(`*Reason:* ${options.whyFlagged.trim()}`);
  }

  lines.push('');
  lines.push('--- Original message ---');
  lines.push(message.body ?? '(media)');

  return lines.join('\n');
};

// ── Component ───────────────────────────────────────────────────

type ForwardMessageModalProps = {
  message: WaMessage;
  sourceConversation: WaConversation;
  conversations: WaConversation[];
  currentUserName: string;
  onClose: () => void;
  onSend: (targetConversationId: string, text: string) => void;
};

export const ForwardMessageModal = ({
  message,
  sourceConversation,
  conversations,
  currentUserName,
  onClose,
  onSend,
}: ForwardMessageModalProps) => {
  const [step, setStep] = useState<ForwardStep>('select-conversation');
  const [targetConversation, setTargetConversation] = useState<WaConversation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sending, setSending] = useState(false);
  const { handleFocus: hotkeyFocus, handleBlur: hotkeyBlur } =
    useSuppressHotkeys('forward-modal-input');
  const [options, setOptions] = useState<ForwardOptions>({
    status: 'warm',
    includeCrmLink: true,
    includeWhatsAppLink: true,
    includeOwner: true,
    includeProgram: false,
    programKey: sourceConversation.justusProgram ?? '',
    includeWhyFlagged: false,
    whyFlagged: '',
  });

  const filteredConversations = useMemo(() => {
    if (!searchTerm) return conversations.filter((c) => c.id !== sourceConversation.id);
    const term = searchTerm.toLowerCase();
    return conversations.filter(
      (c) =>
        c.id !== sourceConversation.id &&
        ((c.leadFullName ?? '').toLowerCase().includes(term) ||
          (c.whatsappName ?? '').toLowerCase().includes(term) ||
          c.leadPhoneNumber.includes(term)),
    );
  }, [conversations, searchTerm, sourceConversation.id]);

  const previewText = useMemo(
    () => buildForwardText(message, sourceConversation, options, currentUserName),
    [message, sourceConversation, options, currentUserName],
  );

  const handleSelectTarget = useCallback((conv: WaConversation) => {
    setTargetConversation(conv);
    setStep('confirm-send');
  }, []);

  const handleSend = useCallback(async () => {
    if (!targetConversation) return;
    setSending(true);
    try {
      onSend(targetConversation.id, previewText);
      onClose();
    } catch {
      setSending(false);
    }
  }, [targetConversation, previewText, onSend, onClose]);

  const getInitials = (conv: WaConversation) => {
    const name = conv.leadFullName || conv.whatsappName;
    if (!name) return conv.leadPhoneNumber.slice(-2);
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  };

  return (
    <StyledOverlay onClick={onClose}>
      <StyledModal onClick={(e) => e.stopPropagation()}>
        <StyledHeader>
          <StyledHeaderTitle>
            {step === 'select-conversation' ? 'Forward to...' : `Forward to ${targetConversation?.leadFullName || targetConversation?.whatsappName || targetConversation?.leadPhoneNumber}`}
          </StyledHeaderTitle>
          <StyledCloseBtn onClick={onClose}>&times;</StyledCloseBtn>
        </StyledHeader>

        <StyledBody>
          {step === 'select-conversation' && (
            <>
              <StyledSearchInput
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={hotkeyFocus}
                onBlur={hotkeyBlur}
                autoFocus
              />
              {filteredConversations.slice(0, 20).map((conv) => (
                <StyledConvItem key={conv.id} onClick={() => handleSelectTarget(conv)}>
                  <StyledConvAvatar>{getInitials(conv)}</StyledConvAvatar>
                  <StyledConvInfo>
                    <StyledConvName>
                      {conv.leadFullName || conv.whatsappName || conv.leadPhoneNumber}
                    </StyledConvName>
                    <StyledConvPhone>{conv.leadPhoneNumber}</StyledConvPhone>
                  </StyledConvInfo>
                </StyledConvItem>
              ))}
              {filteredConversations.length === 0 && (
                <StyledConvPhone style={{ textAlign: 'center', padding: 16 }}>
                  No conversations found
                </StyledConvPhone>
              )}
            </>
          )}

          {step === 'confirm-send' && (
            <>
              <StyledSectionTitle>Lead Status</StyledSectionTitle>
              <StyledStatusRow>
                {STATUS_OPTIONS.map((s) => (
                  <StyledStatusBtn
                    key={s.key}
                    isActive={options.status === s.key}
                    onClick={() => setOptions((prev) => ({ ...prev, status: s.key }))}
                  >
                    {s.emoji} {s.label}
                  </StyledStatusBtn>
                ))}
              </StyledStatusRow>

              <StyledSectionTitle>Include</StyledSectionTitle>
              <StyledOptionRow>
                <StyledCheckbox
                  type="checkbox"
                  checked={options.includeCrmLink}
                  onChange={(e) => setOptions((prev) => ({ ...prev, includeCrmLink: e.target.checked }))}
                />
                <StyledOptionLabel>CRM Link</StyledOptionLabel>
              </StyledOptionRow>
              <StyledOptionRow>
                <StyledCheckbox
                  type="checkbox"
                  checked={options.includeWhatsAppLink}
                  onChange={(e) => setOptions((prev) => ({ ...prev, includeWhatsAppLink: e.target.checked }))}
                />
                <StyledOptionLabel>WhatsApp Link</StyledOptionLabel>
              </StyledOptionRow>
              <StyledOptionRow>
                <StyledCheckbox
                  type="checkbox"
                  checked={options.includeOwner}
                  onChange={(e) => setOptions((prev) => ({ ...prev, includeOwner: e.target.checked }))}
                />
                <StyledOptionLabel>Owner ({sourceConversation.assignedToName || 'Unassigned'})</StyledOptionLabel>
              </StyledOptionRow>
              <StyledOptionRow>
                <StyledCheckbox
                  type="checkbox"
                  checked={options.includeProgram}
                  onChange={(e) => setOptions((prev) => ({ ...prev, includeProgram: e.target.checked }))}
                />
                <StyledOptionLabel>Program ({options.programKey || 'None'})</StyledOptionLabel>
              </StyledOptionRow>
              <StyledOptionRow>
                <StyledCheckbox
                  type="checkbox"
                  checked={options.includeWhyFlagged}
                  onChange={(e) => setOptions((prev) => ({ ...prev, includeWhyFlagged: e.target.checked }))}
                />
                <StyledOptionLabel>Add reason</StyledOptionLabel>
              </StyledOptionRow>
              {options.includeWhyFlagged && (
                <StyledTextarea
                  placeholder="Why are you flagging this lead?"
                  value={options.whyFlagged}
                  onChange={(e) => setOptions((prev) => ({ ...prev, whyFlagged: e.target.value }))}
                  onFocus={hotkeyFocus}
                  onBlur={hotkeyBlur}
                />
              )}

              <StyledPreviewLabel>Preview</StyledPreviewLabel>
              <StyledPreview>{previewText}</StyledPreview>
            </>
          )}
        </StyledBody>

        <StyledFooter>
          {step === 'confirm-send' && (
            <StyledBtn variant="secondary" onClick={() => setStep('select-conversation')}>
              Back
            </StyledBtn>
          )}
          <StyledBtn variant="secondary" onClick={onClose}>
            Cancel
          </StyledBtn>
          {step === 'confirm-send' && (
            <StyledBtn variant="primary" onClick={handleSend} disabled={sending}>
              {sending ? 'Sending...' : 'Forward'}
            </StyledBtn>
          )}
        </StyledFooter>
      </StyledModal>
    </StyledOverlay>
  );
};
