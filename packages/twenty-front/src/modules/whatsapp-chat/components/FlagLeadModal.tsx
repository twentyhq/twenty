import styled from '@emotion/styled';
import { useCallback, useEffect, useState } from 'react';

import { useWhatsAppBridge } from '@/whatsapp-chat/hooks/useWhatsAppBridge';
import { type WaConversation } from '@/whatsapp-chat/types/WhatsAppTypes';
import { useSuppressHotkeys } from '@/whatsapp-chat/hooks/useSuppressHotkeys';

// ── Types ───────────────────────────────────────────────────────

type LeadTemperature = 'WARM' | 'HOT' | 'READY_TO_BUY' | 'OTHER';

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
  max-width: 440px;
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
  gap: 16px;
  overflow-y: auto;
  padding: 16px 20px;
`;

const StyledLeadInfo = styled.div`
  align-items: center;
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  display: flex;
  gap: 12px;
  padding: 12px;
`;

const StyledLeadAvatar = styled.div`
  align-items: center;
  background: #E5E7EB;
  border-radius: 50%;
  color: #374151;
  display: flex;
  font-size: 16px;
  font-weight: 600;
  height: 44px;
  justify-content: center;
  min-width: 44px;
  width: 44px;
`;

const StyledLeadDetails = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const StyledLeadName = styled.span`
  color: #111827;
  font-size: 15px;
  font-weight: 600;
`;

const StyledLeadMeta = styled.span`
  color: #9CA3AF;
  font-size: 12px;
`;

const StyledSectionTitle = styled.span`
  color: #9CA3AF;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
`;

const StyledStatusGrid = styled.div`
  display: grid;
  gap: 8px;
  grid-template-columns: 1fr 1fr;
`;

const StyledStatusBtn = styled.button<{ isActive: boolean; color: string }>`
  background: ${({ isActive, color }) =>
    isActive ? `${color}15` : '#F3F4F6'};
  border: 2px solid ${({ isActive, color }) =>
    isActive ? color : '#E5E7EB'};
  border-radius: 10px;
  color: ${({ isActive, color }) =>
    isActive ? color : '#6B7280'};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  font-family: inherit;
  gap: 4px;
  padding: 12px;
  text-align: left;
  transition: all 120ms ease;

  &:hover { border-color: ${({ color }) => color}; }
`;

const StyledStatusEmoji = styled.span`
  font-size: 20px;
`;

const StyledStatusLabel = styled.span`
  font-size: 13px;
  font-weight: 600;
`;

const StyledStatusDesc = styled.span`
  font-size: 11px;
  opacity: 0.7;
`;

const StyledInput = styled.input`
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

const StyledSelect = styled.select`
  background: #F3F4F6;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  color: #111827;
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  outline: none;
  padding: 10px 12px;
  width: 100%;

  &:focus { border-color: #1A6CFF; }
`;

const StyledTextarea = styled.textarea`
  background: #F3F4F6;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  color: #111827;
  font-family: inherit;
  font-size: 13px;
  min-height: 80px;
  outline: none;
  padding: 10px;
  resize: vertical;
  width: 100%;

  &:focus { border-color: #1A6CFF; }
`;

const StyledCharCount = styled.span`
  color: #9CA3AF;
  font-size: 11px;
  text-align: right;
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

const StyledSuccessBanner = styled.div`
  align-items: center;
  background: #DCFCE7;
  border: 1px solid #22C55E;
  border-radius: 8px;
  color: #166534;
  display: flex;
  font-size: 14px;
  font-weight: 500;
  gap: 8px;
  justify-content: center;
  padding: 16px;
`;

// ── Status options ──────────────────────────────────────────────

const TEMPERATURE_OPTIONS: {
  key: LeadTemperature;
  emoji: string;
  label: string;
  desc: string;
  color: string;
}[] = [
  { key: 'WARM', emoji: '🟡', label: 'Warm', desc: 'Showing interest', color: '#EAB308' },
  { key: 'HOT', emoji: '🔥', label: 'Hot', desc: 'Actively engaged', color: '#F97316' },
  { key: 'READY_TO_BUY', emoji: '🎯', label: 'Ready to Buy', desc: 'High intent', color: '#22C55E' },
  { key: 'OTHER', emoji: '📝', label: 'Other', desc: 'Custom status', color: '#6B7280' },
];

// ── Component ───────────────────────────────────────────────────

type FlagLeadModalProps = {
  conversation: WaConversation;
  currentUserName: string;
  onClose: () => void;
  onFlagged?: () => void;
};

export const FlagLeadModal = ({
  conversation,
  currentUserName,
  onClose,
  onFlagged,
}: FlagLeadModalProps) => {
  const { bridgeFetch } = useWhatsAppBridge();
  const [temperature, setTemperature] = useState<LeadTemperature>('WARM');
  const [customStatus, setCustomStatus] = useState('');
  const [assignedTo, setAssignedTo] = useState(conversation.assignedToEmail ?? '');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [workspaceMembers, setWorkspaceMembers] = useState<
    { email: string; fullName: string }[]
  >([]);

  useEffect(() => {
    let cancelled = false;
    bridgeFetch<{ members: { email: string; fullName: string }[] }>(
      '/api/v1/conversations/members',
    )
      .then((data) => {
        if (!cancelled && data?.members) setWorkspaceMembers(data.members);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [bridgeFetch]);
  const { handleFocus: hotkeyFocus, handleBlur: hotkeyBlur } =
    useSuppressHotkeys('flag-lead-modal-input');

  const displayName =
    conversation.leadFullName ||
    conversation.whatsappName ||
    conversation.leadPhoneNumber;

  const initials = displayName
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);

    try {
      const finalStatus = temperature === 'OTHER' ? customStatus.trim() || 'OTHER' : temperature;

      await bridgeFetch(`/api/v1/conversations/${conversation.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          assigned_to_email: assignedTo.trim() || undefined,
          lead_temperature: finalStatus,
          sales_notes: notes.trim() || undefined,
          flagged_by: currentUserName,
        }),
      });

      setSuccess(true);
      setTimeout(() => {
        onFlagged?.();
        onClose();
      }, 1500);
    } catch {
      setSubmitting(false);
    }
  }, [bridgeFetch, conversation.id, temperature, customStatus, assignedTo, notes, currentUserName, onFlagged, onClose]);

  if (success) {
    return (
      <StyledOverlay onClick={onClose}>
        <StyledModal onClick={(e) => e.stopPropagation()}>
          <StyledBody>
            <StyledSuccessBanner>
              Lead flagged as {temperature === 'OTHER' ? customStatus || 'OTHER' : temperature}
            </StyledSuccessBanner>
          </StyledBody>
        </StyledModal>
      </StyledOverlay>
    );
  }

  return (
    <StyledOverlay onClick={onClose}>
      <StyledModal onClick={(e) => e.stopPropagation()}>
        <StyledHeader>
          <StyledHeaderTitle>Flag Lead</StyledHeaderTitle>
          <StyledCloseBtn onClick={onClose}>&times;</StyledCloseBtn>
        </StyledHeader>

        <StyledBody>
          <StyledLeadInfo>
            <StyledLeadAvatar>{initials || '?'}</StyledLeadAvatar>
            <StyledLeadDetails>
              <StyledLeadName>{displayName}</StyledLeadName>
              <StyledLeadMeta>
                {conversation.leadPhoneNumber}
                {conversation.contactEmail ? ` · ${conversation.contactEmail}` : ''}
              </StyledLeadMeta>
            </StyledLeadDetails>
          </StyledLeadInfo>

          <StyledSectionTitle>Status</StyledSectionTitle>
          <StyledStatusGrid>
            {TEMPERATURE_OPTIONS.map((opt) => (
              <StyledStatusBtn
                key={opt.key}
                isActive={temperature === opt.key}
                color={opt.color}
                onClick={() => setTemperature(opt.key)}
              >
                <StyledStatusEmoji>{opt.emoji}</StyledStatusEmoji>
                <StyledStatusLabel>{opt.label}</StyledStatusLabel>
                <StyledStatusDesc>{opt.desc}</StyledStatusDesc>
              </StyledStatusBtn>
            ))}
          </StyledStatusGrid>

          {temperature === 'OTHER' && (
            <StyledInput
              placeholder="Custom status..."
              value={customStatus}
              onChange={(e) => setCustomStatus(e.target.value)}
              onFocus={hotkeyFocus}
              onBlur={hotkeyBlur}
              autoFocus
            />
          )}

          <StyledSectionTitle>Assign To</StyledSectionTitle>
          <StyledSelect
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            onFocus={hotkeyFocus as any}
            onBlur={hotkeyBlur as any}
          >
            <option value="">Unassigned</option>
            {workspaceMembers.map((m) => (
              <option key={m.email} value={m.email}>
                {m.fullName}
              </option>
            ))}
          </StyledSelect>

          <StyledSectionTitle>Sales Notes</StyledSectionTitle>
          <StyledTextarea
            placeholder="e.g., Showed strong interest in Feb training program..."
            value={notes}
            onChange={(e) => setNotes(e.target.value.slice(0, 2000))}
            onFocus={hotkeyFocus}
            onBlur={hotkeyBlur}
            maxLength={2000}
          />
          <StyledCharCount>{notes.length}/2000</StyledCharCount>
        </StyledBody>

        <StyledFooter>
          <StyledBtn variant="secondary" onClick={onClose}>
            Cancel
          </StyledBtn>
          <StyledBtn variant="primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Flagging...' : 'Flag Lead'}
          </StyledBtn>
        </StyledFooter>
      </StyledModal>
    </StyledOverlay>
  );
};
