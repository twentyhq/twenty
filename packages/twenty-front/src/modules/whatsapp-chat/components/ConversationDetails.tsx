import styled from '@emotion/styled';
import { useCallback, useState } from 'react';

import { IconX } from 'twenty-ui/display';
import { useWhatsAppBridge } from '@/whatsapp-chat/hooks/useWhatsAppBridge';
import { useContact } from '@/whatsapp-chat/hooks/useContact';
import { useCloseCalls } from '@/whatsapp-chat/hooks/useCloseCalls';
import { useCloseOpportunities } from '@/whatsapp-chat/hooks/useCloseOpportunities';
import { useMopSummary } from '@/whatsapp-chat/hooks/useMopSummary';
import { useMopDetails } from '@/whatsapp-chat/hooks/useMopDetails';
import { type WaConversation } from '@/whatsapp-chat/types/WhatsAppTypes';
import { useProfilePicture } from '@/whatsapp-chat/hooks/useProfilePicture';

// ── Styled components ───────────────────────────────────────────

const StyledContainer = styled.div`
  background: #F5F6F8;
  border-left: 1px solid #D1D5DB;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 320px;
  width: 320px;
`;

const StyledHeader = styled.div`
  align-items: center;
  background: #FFFFFF;
  border-bottom: 1px solid #D1D5DB;
  display: flex;
  justify-content: space-between;
  min-height: 56px;
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
`;

const StyledTitle = styled.span`
  color: #111827;
  font-size: 15px;
  font-weight: 600;
`;

const StyledCloseButton = styled.button`
  align-items: center;
  background: none;
  border: none;
  border-radius: 4px;
  color: #9CA3AF;
  cursor: pointer;
  display: flex;
  height: 28px;
  justify-content: center;
  width: 28px;

  &:hover {
    background: #F3F4F6;
    color: #374151;
  }
`;

const StyledTabs = styled.div`
  background: #FFFFFF;
  border-bottom: 1px solid #D1D5DB;
  display: flex;
  gap: 0;
`;

const StyledTab = styled.button<{ isActive: boolean }>`
  background: none;
  border: none;
  border-bottom: 2px solid
    ${({ isActive }) =>
      isActive ? '#1A6CFF' : 'transparent'};
  color: ${({ isActive }) =>
    isActive ? '#1A6CFF' : '#9CA3AF'};
  cursor: pointer;
  flex: 1;
  font-family: inherit;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(1)};
  transition: all 120ms ease;

  &:hover {
    color: ${({ theme }) => theme.font.color.primary};
  }
`;

const StyledBody = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledAvatar = styled.div<{ isClient?: boolean }>`
  align-items: center;
  align-self: center;
  background: ${({ isClient }) =>
    isClient ? '#1A6CFF' : '#E5E7EB'};
  border-radius: 50%;
  color: ${({ isClient }) =>
    isClient ? '#FFFFFF' : '#374151'};
  display: flex;
  font-size: 24px;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  height: 72px;
  justify-content: center;
  width: 72px;
`;

const StyledProfilePicture = styled.img`
  align-self: center;
  border-radius: 50%;
  height: 72px;
  object-fit: cover;
  width: 72px;
`;

const StyledContactName = styled.div`
  align-self: center;
  color: #111827;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
`;

const StyledContactSubtext = styled.div`
  align-self: center;
  color: #9CA3AF;
  font-size: 13px;
  text-align: center;
`;

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledSectionTitle = styled.span`
  color: #9CA3AF;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
`;

const StyledField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const StyledFieldLabel = styled.span`
  color: #9CA3AF;
  font-size: 12px;
`;

const StyledFieldValue = styled.span`
  color: #111827;
  font-size: 13px;
  word-break: break-word;
`;

const BADGE_STYLES = {
  success: { bg: '#DCFCE7', color: '#166534' },
  warning: { bg: '#FEF3C7', color: '#92400E' },
  danger: { bg: '#FEE2E2', color: '#DC2626' },
  info: { bg: '#DBEAFE', color: '#1D4ED8' },
  neutral: { bg: '#F3F4F6', color: '#6B7280' },
};

const StyledBadge = styled.span<{
  variant: 'success' | 'warning' | 'neutral' | 'danger' | 'info';
}>`
  background: ${({ variant }) => BADGE_STYLES[variant].bg};
  border-radius: 4px;
  color: ${({ variant }) => BADGE_STYLES[variant].color};
  display: inline-block;
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
  width: fit-content;
`;

const StyledBadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledAssignInput = styled.input`
  background: #FFFFFF;
  border: 1px solid #D1D5DB;
  border-radius: 4px;
  color: #111827;
  font-family: inherit;
  font-size: 13px;
  outline: none;
  padding: 4px 8px;

  &:focus {
    border-color: #1A6CFF;
  }
`;

const StyledAssignButton = styled.button`
  background: #1A6CFF;
  border: none;
  border-radius: 4px;
  color: #FFFFFF;
  cursor: pointer;
  font-size: 13px;
  padding: 4px 8px;

  &:hover {
    opacity: 0.9;
  }
`;

const StyledLoadingText = styled.span`
  color: #9CA3AF;
  font-size: 11px;
  font-style: italic;
`;

const StyledDivider = styled.div`
  background: #E5E7EB;
  height: 1px;
  width: 100%;
`;

const StyledPipelineRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledPipelineStep = styled.div<{ active: boolean }>`
  align-items: center;
  background: ${({ active }) =>
    active ? '#DCFCE7' : '#F3F4F6'};
  border-radius: 4px;
  color: ${({ active }) =>
    active ? '#166534' : '#9CA3AF'};
  display: flex;
  flex: 1;
  flex-direction: column;
  font-size: 10px;
  font-weight: 600;
  gap: 2px;
  padding: 4px;
  text-align: center;
`;

const StyledPipelineConnector = styled.div<{ active: boolean }>`
  background: ${({ active }) =>
    active ? '#22C55E' : '#E5E7EB'};
  height: 2px;
  width: 8px;
`;

const StyledCard = styled.div`
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
`;

const StyledCardHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const StyledCardTitle = styled.span`
  color: #111827;
  font-size: 13px;
  font-weight: 500;
`;

const StyledCardMeta = styled.span`
  color: #9CA3AF;
  font-size: 11px;
`;

const StyledCardBody = styled.span`
  color: #6B7280;
  font-size: 11px;
  line-height: 1.4;
`;

const StyledEmptyState = styled.div`
  color: #9CA3AF;
  font-size: 13px;
  padding: 16px 0;
  text-align: center;
`;

const StyledMopCard = styled.div`
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px;
`;

const StyledMopOfferName = styled.span`
  color: #111827;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.3;
`;

const StyledMopIconRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const StyledMopIcon = styled.span<{ active: boolean }>`
  align-items: center;
  background: ${({ active }) => (active ? '#DCFCE7' : '#F3F4F6')};
  border-radius: 4px;
  color: ${({ active }) => (active ? '#166534' : '#9CA3AF')};
  display: inline-flex;
  font-size: 10px;
  font-weight: 600;
  gap: 3px;
  padding: 2px 6px;
`;

const StyledShowMore = styled.button`
  background: none;
  border: none;
  color: #1A6CFF;
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
  padding: 4px 0;

  &:hover {
    text-decoration: underline;
  }
`;

const StyledStatGrid = styled.div`
  display: grid;
  gap: 8px;
  grid-template-columns: 1fr 1fr;
`;

const StyledStatBox = styled.div`
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px;
`;

const StyledStatValue = styled.span`
  color: #111827;
  font-size: 16px;
  font-weight: 600;
`;

const StyledStatLabel = styled.span`
  color: #9CA3AF;
  font-size: 10px;
  text-transform: uppercase;
`;

// ── Helpers ─────────────────────────────────────────────────────

const formatDate = (isoString: string | null): string => {
  if (!isoString) return '—';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;
  return date.toLocaleDateString([], {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

type TabId = 'profile' | 'mop' | 'conversation' | 'assignment' | 'calls' | 'opportunities';

const cleanMopName = (name?: string): string => {
  if (!name) return '';
  // Remove ID prefix like "ABF123 - " from offer name
  const parts = name.split(' — ');
  return parts[parts.length - 1];
};

const formatWatchTime = (minutes: number): string => {
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

const formatCallDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
};

// ── Component ───────────────────────────────────────────────────

type ConversationDetailsProps = {
  conversation: WaConversation;
  onClose: () => void;
  onUpdate?: (id: string, updates: Partial<WaConversation>) => void;
};

export const ConversationDetails = ({
  conversation,
  onClose,
  onUpdate,
}: ConversationDetailsProps) => {
  const { bridgeFetch } = useWhatsAppBridge();
  const { contact, loading: contactLoading } = useContact(
    conversation.leadPhoneNumber,
  );
  const { calls, loading: callsLoading } = useCloseCalls(
    conversation.leadPhoneNumber,
  );
  const { opportunities, loading: opportunitiesLoading } =
    useCloseOpportunities(conversation.leadPhoneNumber);
  const { pictureUrl } = useProfilePicture(
    conversation.sessionName,
    conversation.leadPhoneNumber,
  );
  const contactEmail = contact?.email || conversation.contactEmail || null;
  const { summary: mopSummary, loading: mopSummaryLoading } =
    useMopSummary(contactEmail);
  const { records: mopRecords, loading: mopRecordsLoading } =
    useMopDetails(contactEmail);
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [mopExpanded, setMopExpanded] = useState(false);
  const [assignEmail, setAssignEmail] = useState(
    conversation.assignedToEmail ?? '',
  );

  const displayName =
    contact?.fullName ||
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

  const isClient = contact?.isClient || conversation.isClient;

  const handleAssign = useCallback(async () => {
    const trimmedEmail = assignEmail.trim();
    if (!trimmedEmail) return;

    try {
      await bridgeFetch(`/api/v1/conversations/${conversation.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ assigned_to_email: trimmedEmail }),
      });
      onUpdate?.(conversation.id, { assignedToEmail: trimmedEmail });
    } catch {
      // Silently fail
    }
  }, [bridgeFetch, conversation.id, assignEmail, onUpdate]);

  return (
    <StyledContainer>
      <StyledHeader>
        <StyledTitle>Details</StyledTitle>
        <StyledCloseButton onClick={onClose}>
          <IconX size={16} />
        </StyledCloseButton>
      </StyledHeader>

      <StyledTabs>
        <StyledTab
          isActive={activeTab === 'profile'}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </StyledTab>
        <StyledTab
          isActive={activeTab === 'mop'}
          onClick={() => setActiveTab('mop')}
        >
          MOP{mopRecords.length > 0 ? ` (${mopRecords.length})` : ''}
        </StyledTab>
        <StyledTab
          isActive={activeTab === 'conversation'}
          onClick={() => setActiveTab('conversation')}
        >
          Conversation
        </StyledTab>
        <StyledTab
          isActive={activeTab === 'assignment'}
          onClick={() => setActiveTab('assignment')}
        >
          Assignment
        </StyledTab>
        <StyledTab
          isActive={activeTab === 'calls'}
          onClick={() => setActiveTab('calls')}
        >
          Calls{calls.length > 0 ? ` (${calls.length})` : ''}
        </StyledTab>
        <StyledTab
          isActive={activeTab === 'opportunities'}
          onClick={() => setActiveTab('opportunities')}
        >
          Opps{opportunities.length > 0 ? ` (${opportunities.length})` : ''}
        </StyledTab>
      </StyledTabs>

      <StyledBody>
        {/* Avatar + Name always visible */}
        {pictureUrl ? (
          <StyledProfilePicture src={pictureUrl} alt={displayName} />
        ) : (
          <StyledAvatar isClient={isClient}>{initials || '?'}</StyledAvatar>
        )}
        <StyledContactName>{displayName}</StyledContactName>
        {conversation.leadPhoneNumber !== displayName && (
          <StyledContactSubtext>
            {conversation.leadPhoneNumber}
          </StyledContactSubtext>
        )}

        {contactLoading && (
          <StyledLoadingText>Loading contact data...</StyledLoadingText>
        )}

        {/* ── Profile Tab ──────────────────────────────────── */}
        {activeTab === 'profile' && (
          <>
            <StyledSection>
              <StyledSectionTitle>Contact Info</StyledSectionTitle>
              <StyledField>
                <StyledFieldLabel>Phone</StyledFieldLabel>
                <StyledFieldValue>
                  {conversation.leadPhoneNumber}
                </StyledFieldValue>
              </StyledField>
              {conversation.whatsappName && (
                <StyledField>
                  <StyledFieldLabel>WhatsApp Name</StyledFieldLabel>
                  <StyledFieldValue>
                    {conversation.whatsappName}
                  </StyledFieldValue>
                </StyledField>
              )}
              {contact?.email && (
                <StyledField>
                  <StyledFieldLabel>Email</StyledFieldLabel>
                  <StyledFieldValue>{contact.email}</StyledFieldValue>
                </StyledField>
              )}
              {contact?.country && (
                <StyledField>
                  <StyledFieldLabel>Country</StyledFieldLabel>
                  <StyledFieldValue>{contact.country}</StyledFieldValue>
                </StyledField>
              )}
              {contact?.source && (
                <StyledField>
                  <StyledFieldLabel>Source</StyledFieldLabel>
                  <StyledFieldValue>{contact.source}</StyledFieldValue>
                </StyledField>
              )}
            </StyledSection>

            <StyledDivider />

            {contact && (
              <>
                <StyledSection>
                  <StyledSectionTitle>Client Status</StyledSectionTitle>
                  <StyledBadgeRow>
                    {contact.isClient && (
                      <StyledBadge variant="success">Bexio Client</StyledBadge>
                    )}
                    {contact.isActiveMainProgramClient && (
                      <StyledBadge variant="success">Active LZR</StyledBadge>
                    )}
                    {contact.isMainProgramClient &&
                      !contact.isActiveMainProgramClient && (
                        <StyledBadge variant="neutral">
                          Main Program
                        </StyledBadge>
                      )}
                    {contact.isTrainingCertClient && (
                      <StyledBadge variant="neutral">Training Cert</StyledBadge>
                    )}
                    {contact.isFinishingLzr30Days && (
                      <StyledBadge variant="warning">
                        Finishing in 30d
                      </StyledBadge>
                    )}
                    {!contact.isClient && !contact.isMainProgramClient && (
                      <StyledBadge variant="neutral">Lead</StyledBadge>
                    )}
                  </StyledBadgeRow>
                  {contact.bexioClientId && (
                    <StyledField>
                      <StyledFieldLabel>Bexio ID</StyledFieldLabel>
                      <StyledFieldValue>
                        {contact.bexioClientId}
                      </StyledFieldValue>
                    </StyledField>
                  )}
                </StyledSection>

                <StyledSection>
                  <StyledSectionTitle>Contract Pipeline</StyledSectionTitle>
                  <StyledPipelineRow>
                    <StyledPipelineStep
                      active={!!contact.contractSent || !!contact.contractIsSigned}
                    >
                      SA
                    </StyledPipelineStep>
                    <StyledPipelineConnector
                      active={!!contact.contractSent}
                    />
                    <StyledPipelineStep
                      active={!!contact.contractSent}
                    >
                      SENT
                    </StyledPipelineStep>
                    <StyledPipelineConnector
                      active={!!contact.contractViewed}
                    />
                    <StyledPipelineStep
                      active={!!contact.contractViewed}
                    >
                      VIEW
                    </StyledPipelineStep>
                    <StyledPipelineConnector
                      active={!!contact.contractIsSigned}
                    />
                    <StyledPipelineStep active={!!contact.contractIsSigned}>
                      SIGN
                    </StyledPipelineStep>
                  </StyledPipelineRow>
                  <StyledBadgeRow>
                    {contact.pandadocIsSigned && (
                      <StyledBadge variant="success">PandaDoc</StyledBadge>
                    )}
                    {contact.docusealIsSigned && (
                      <StyledBadge variant="success">DocuSeal</StyledBadge>
                    )}
                  </StyledBadgeRow>
                </StyledSection>

                {(contact.justusProgram || contact.closeLeadStatus) && (
                  <StyledSection>
                    <StyledSectionTitle>Close.io</StyledSectionTitle>
                    {contact.justusProgram && (
                      <StyledField>
                        <StyledFieldLabel>Program</StyledFieldLabel>
                        <StyledFieldValue>
                          {contact.justusProgram}
                          {contact.justusDuration
                            ? ` (${contact.justusDuration})`
                            : ''}
                        </StyledFieldValue>
                      </StyledField>
                    )}
                    {contact.closeLeadStatus && (
                      <StyledField>
                        <StyledFieldLabel>Lead Status</StyledFieldLabel>
                        <StyledFieldValue>
                          {contact.closeLeadStatus}
                        </StyledFieldValue>
                      </StyledField>
                    )}
                    {contact.closeLeadUrl && (
                      <StyledField>
                        <StyledFieldLabel>Close Link</StyledFieldLabel>
                        <StyledFieldValue>
                          <a
                            href={contact.closeLeadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'inherit', textDecoration: 'underline' }}
                          >
                            Open in Close
                          </a>
                        </StyledFieldValue>
                      </StyledField>
                    )}
                  </StyledSection>
                )}

                {(contact.lzrStartDate || contact.lzrEndDate) && (
                  <StyledSection>
                    <StyledSectionTitle>LZR Program</StyledSectionTitle>
                    {contact.lzrStartDate && (
                      <StyledField>
                        <StyledFieldLabel>Start Date</StyledFieldLabel>
                        <StyledFieldValue>
                          {formatDate(contact.lzrStartDate)}
                        </StyledFieldValue>
                      </StyledField>
                    )}
                    {contact.lzrEndDate && (
                      <StyledField>
                        <StyledFieldLabel>End Date</StyledFieldLabel>
                        <StyledFieldValue>
                          {formatDate(contact.lzrEndDate)}
                        </StyledFieldValue>
                      </StyledField>
                    )}
                    {contact.lzrMonthDuration && (
                      <StyledField>
                        <StyledFieldLabel>Duration</StyledFieldLabel>
                        <StyledFieldValue>
                          {contact.lzrMonthDuration} months
                        </StyledFieldValue>
                      </StyledField>
                    )}
                  </StyledSection>
                )}
              </>
            )}

            {!contact && !contactLoading && (
              <StyledSection>
                <StyledSectionTitle>Status</StyledSectionTitle>
                <StyledBadgeRow>
                  <StyledBadge
                    variant={conversation.isClient ? 'success' : 'neutral'}
                  >
                    {conversation.isClient ? 'Client' : 'Lead'}
                  </StyledBadge>
                </StyledBadgeRow>
              </StyledSection>
            )}
          </>
        )}

        {/* ── MOP Tab ─────────────────────────────────────── */}
        {activeTab === 'mop' && (
          <>
            {!contactEmail && (
              <StyledEmptyState>No email found for this contact</StyledEmptyState>
            )}

            {contactEmail && mopSummaryLoading && (
              <StyledLoadingText>Loading MOP data...</StyledLoadingText>
            )}

            {contactEmail && !mopSummaryLoading && mopSummary && (
              <StyledSection>
                <StyledSectionTitle>Summary</StyledSectionTitle>
                <StyledStatGrid>
                  <StyledStatBox>
                    <StyledStatValue>{mopSummary.mopCount}</StyledStatValue>
                    <StyledStatLabel>Offers</StyledStatLabel>
                  </StyledStatBox>
                  <StyledStatBox>
                    <StyledStatValue>
                      {formatWatchTime(mopSummary.mopTotalWatchTimeMinutes)}
                    </StyledStatValue>
                    <StyledStatLabel>Watch Time</StyledStatLabel>
                  </StyledStatBox>
                  {mopSummary.mopLastCallDurationSeconds != null &&
                    mopSummary.mopLastCallDurationSeconds > 0 && (
                      <StyledStatBox>
                        <StyledStatValue>
                          {formatCallDuration(mopSummary.mopLastCallDurationSeconds)}
                        </StyledStatValue>
                        <StyledStatLabel>Last Call</StyledStatLabel>
                      </StyledStatBox>
                    )}
                </StyledStatGrid>
                {mopSummary.mopFirstSignupDate && (
                  <StyledField>
                    <StyledFieldLabel>First Signup</StyledFieldLabel>
                    <StyledFieldValue>
                      {formatDate(mopSummary.mopFirstSignupDate)}
                    </StyledFieldValue>
                  </StyledField>
                )}
                {mopSummary.mopLastActivityDate && (
                  <StyledField>
                    <StyledFieldLabel>Last Activity</StyledFieldLabel>
                    <StyledFieldValue>
                      {formatDate(mopSummary.mopLastActivityDate)}
                    </StyledFieldValue>
                  </StyledField>
                )}
                {mopSummary.mopLatestOfferName && (
                  <StyledField>
                    <StyledFieldLabel>Latest Offer</StyledFieldLabel>
                    <StyledFieldValue>
                      {cleanMopName(mopSummary.mopLatestOfferName)}
                    </StyledFieldValue>
                  </StyledField>
                )}
                {mopSummary.mopLastCallDate && (
                  <StyledField>
                    <StyledFieldLabel>Last Call Date</StyledFieldLabel>
                    <StyledFieldValue>
                      {formatDate(mopSummary.mopLastCallDate)}
                    </StyledFieldValue>
                  </StyledField>
                )}
              </StyledSection>
            )}

            {contactEmail && !mopSummaryLoading && !mopSummary && (
              <StyledEmptyState>No marketing participation data</StyledEmptyState>
            )}

            {contactEmail && mopRecords.length > 0 && (
              <>
                <StyledDivider />
                <StyledSection>
                  <StyledSectionTitle>Marketing History</StyledSectionTitle>
                  {mopRecordsLoading && (
                    <StyledLoadingText>Loading offers...</StyledLoadingText>
                  )}
                  {(mopExpanded ? mopRecords : mopRecords.slice(0, 3)).map(
                    (mop) => (
                      <StyledMopCard key={mop.id}>
                        <StyledMopOfferName>
                          {cleanMopName(mop.marketingOfferName)}
                        </StyledMopOfferName>
                        {mop.mopZoomLastActive && (
                          <StyledCardMeta>
                            Last active: {formatDate(mop.mopZoomLastActive)}
                          </StyledCardMeta>
                        )}
                        <StyledMopIconRow>
                          <StyledMopIcon active={mop.attendedSession}>
                            {mop.attendedSession ? '✓' : '✗'} Attended
                          </StyledMopIcon>
                          {mop.totalWatchTime > 0 && (
                            <StyledMopIcon active>
                              {formatWatchTime(mop.totalWatchTime)}
                            </StyledMopIcon>
                          )}
                          <StyledMopIcon active={mop.hasConverted}>
                            {mop.hasConverted ? '✓' : '✗'} Converted
                          </StyledMopIcon>
                          <StyledMopIcon active={mop.docusealIsSigned}>
                            {mop.docusealIsSigned ? '✓' : '✗'} Signed
                          </StyledMopIcon>
                          {mop.completedStrukturanalyse != null && (
                            <StyledMopIcon active={mop.completedStrukturanalyse}>
                              {mop.completedStrukturanalyse ? '✓' : '✗'} SA
                            </StyledMopIcon>
                          )}
                        </StyledMopIconRow>
                      </StyledMopCard>
                    ),
                  )}
                  {mopRecords.length > 3 && (
                    <StyledShowMore
                      onClick={() => setMopExpanded((prev) => !prev)}
                    >
                      {mopExpanded
                        ? 'Show less'
                        : `Show ${mopRecords.length - 3} more offers`}
                    </StyledShowMore>
                  )}
                </StyledSection>
              </>
            )}
          </>
        )}

        {/* ── Conversation Tab ─────────────────────────────── */}
        {activeTab === 'conversation' && (
          <>
            <StyledSection>
              <StyledSectionTitle>Stats</StyledSectionTitle>
              <StyledField>
                <StyledFieldLabel>Messages</StyledFieldLabel>
                <StyledFieldValue>
                  {conversation.messageCount ?? 'Unknown'}
                </StyledFieldValue>
              </StyledField>
              <StyledField>
                <StyledFieldLabel>Session</StyledFieldLabel>
                <StyledFieldValue>
                  {conversation.sessionName}
                </StyledFieldValue>
              </StyledField>
            </StyledSection>

            <StyledDivider />

            <StyledSection>
              <StyledSectionTitle>Status</StyledSectionTitle>
              <StyledBadgeRow>
                {conversation.isPinned && (
                  <StyledBadge variant="info">Pinned</StyledBadge>
                )}
                {conversation.isArchived && (
                  <StyledBadge variant="neutral">Archived</StyledBadge>
                )}
                {conversation.isUnread && (
                  <StyledBadge variant="warning">Unread</StyledBadge>
                )}
                {!conversation.lastMessageFromAgent && (
                  <StyledBadge variant="danger">Needs reply</StyledBadge>
                )}
                {conversation.lastMessageFromAgent && (
                  <StyledBadge variant="success">Replied</StyledBadge>
                )}
              </StyledBadgeRow>
            </StyledSection>

            <StyledDivider />

            <StyledSection>
              <StyledSectionTitle>Last Message</StyledSectionTitle>
              <StyledField>
                <StyledFieldLabel>
                  {conversation.lastMessageFromAgent ? 'You' : 'Contact'}
                </StyledFieldLabel>
                <StyledFieldValue>
                  {conversation.lastMessageBody || '—'}
                </StyledFieldValue>
              </StyledField>
              <StyledField>
                <StyledFieldLabel>Time</StyledFieldLabel>
                <StyledFieldValue>
                  {formatDate(conversation.lastMessageAt)}
                </StyledFieldValue>
              </StyledField>
            </StyledSection>
          </>
        )}

        {/* ── Calls Tab ───────────────────────────────────── */}
        {activeTab === 'calls' && (
          <>
            <StyledSection>
              <StyledSectionTitle>Close.io Calls</StyledSectionTitle>
              {callsLoading && (
                <StyledLoadingText>Loading calls...</StyledLoadingText>
              )}
              {!callsLoading && calls.length === 0 && (
                <StyledEmptyState>No calls recorded</StyledEmptyState>
              )}
              {calls.map((call) => (
                <StyledCard key={call.id}>
                  <StyledCardHeader>
                    <StyledCardTitle>
                      {call.direction === 'outbound' ? 'Outgoing' : 'Incoming'}
                      {call.disposition ? ` · ${call.disposition}` : ''}
                    </StyledCardTitle>
                    <StyledCardMeta>
                      {call.dateCreated ? formatDate(call.dateCreated) : ''}
                    </StyledCardMeta>
                  </StyledCardHeader>
                  <StyledCardBody>
                    {call.duration != null && (
                      <span>
                        {Math.floor(call.duration / 60)}m{' '}
                        {call.duration % 60}s
                      </span>
                    )}
                    {call.userName && <span> · {call.userName}</span>}
                    {call.status && <span> · {call.status}</span>}
                  </StyledCardBody>
                  {call.note && (
                    <StyledCardBody>{call.note}</StyledCardBody>
                  )}
                </StyledCard>
              ))}
            </StyledSection>
          </>
        )}

        {/* ── Opportunities Tab ──────────────────────────────── */}
        {activeTab === 'opportunities' && (
          <>
            <StyledSection>
              <StyledSectionTitle>Close.io Opportunities</StyledSectionTitle>
              {opportunitiesLoading && (
                <StyledLoadingText>Loading opportunities...</StyledLoadingText>
              )}
              {!opportunitiesLoading && opportunities.length === 0 && (
                <StyledEmptyState>No opportunities found</StyledEmptyState>
              )}
              {opportunities.map((opp) => (
                <StyledCard key={opp.id}>
                  <StyledCardHeader>
                    <StyledCardTitle>
                      {opp.statusLabel || opp.statusType || 'Unknown'}
                    </StyledCardTitle>
                    <StyledBadge
                      variant={
                        opp.statusType === 'won'
                          ? 'success'
                          : opp.statusType === 'lost'
                            ? 'danger'
                            : 'info'
                      }
                    >
                      {opp.statusType || 'open'}
                    </StyledBadge>
                  </StyledCardHeader>
                  {(opp.value != null || opp.confidence != null) && (
                    <StyledCardBody>
                      {opp.value != null && (
                        <span>
                          Value: {opp.value}
                          {opp.valuePeriod ? `/${opp.valuePeriod}` : ''}
                        </span>
                      )}
                      {opp.confidence != null && (
                        <span>
                          {opp.value != null ? ' · ' : ''}
                          Confidence: {opp.confidence}%
                        </span>
                      )}
                    </StyledCardBody>
                  )}
                  <StyledCardMeta>
                    {opp.userName && <span>{opp.userName}</span>}
                    {opp.dateCreated && (
                      <span>
                        {opp.userName ? ' · ' : ''}
                        Created {formatDate(opp.dateCreated)}
                      </span>
                    )}
                    {opp.dateWon && <span> · Won {formatDate(opp.dateWon)}</span>}
                    {opp.dateLost && (
                      <span> · Lost {formatDate(opp.dateLost)}</span>
                    )}
                  </StyledCardMeta>
                  {opp.note && (
                    <StyledCardBody>{opp.note}</StyledCardBody>
                  )}
                  {opp.leadName && (
                    <StyledCardMeta>Lead: {opp.leadName}</StyledCardMeta>
                  )}
                </StyledCard>
              ))}
            </StyledSection>
          </>
        )}

        {/* ── Assignment Tab ───────────────────────────────── */}
        {activeTab === 'assignment' && (
          <>
            <StyledSection>
              <StyledSectionTitle>Owner</StyledSectionTitle>
              {(contact?.tobAssignedName || conversation.assignedToName) && (
                <StyledField>
                  <StyledFieldLabel>Currently assigned to</StyledFieldLabel>
                  <StyledFieldValue>
                    {contact?.tobAssignedName || conversation.assignedToName}
                  </StyledFieldValue>
                </StyledField>
              )}
              {(contact?.tobAssignedEmail ||
                conversation.assignedToEmail) && (
                <StyledField>
                  <StyledFieldLabel>Email</StyledFieldLabel>
                  <StyledFieldValue>
                    {contact?.tobAssignedEmail || conversation.assignedToEmail}
                  </StyledFieldValue>
                </StyledField>
              )}
              {!contact?.tobAssignedName && !conversation.assignedToName && (
                <StyledBadge variant="neutral">Unassigned</StyledBadge>
              )}
            </StyledSection>

            <StyledDivider />

            <StyledSection>
              <StyledSectionTitle>Reassign</StyledSectionTitle>
              <StyledAssignInput
                type="email"
                placeholder="Assign to email..."
                value={assignEmail}
                onChange={(e) => setAssignEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAssign();
                  }
                }}
              />
              <StyledAssignButton onClick={handleAssign}>
                Assign
              </StyledAssignButton>
            </StyledSection>

            <StyledDivider />

            <StyledSection>
              <StyledSectionTitle>Coach</StyledSectionTitle>
              {conversation.coachLeadOwnerName ? (
                <>
                  <StyledField>
                    <StyledFieldLabel>Name</StyledFieldLabel>
                    <StyledFieldValue>
                      {conversation.coachLeadOwnerName}
                    </StyledFieldValue>
                  </StyledField>
                  {conversation.coachLeadOwnerEmail && (
                    <StyledField>
                      <StyledFieldLabel>Email</StyledFieldLabel>
                      <StyledFieldValue>
                        {conversation.coachLeadOwnerEmail}
                      </StyledFieldValue>
                    </StyledField>
                  )}
                </>
              ) : (
                <StyledBadge variant="neutral">No coach assigned</StyledBadge>
              )}
            </StyledSection>
          </>
        )}
      </StyledBody>
    </StyledContainer>
  );
};
