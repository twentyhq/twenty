import styled from '@emotion/styled';
import { useCallback, useEffect, useRef, useState, lazy, Suspense } from 'react';

import { IconCheck, IconCopy, IconX } from 'twenty-ui/display';
import { useWhatsAppBridge } from '@/whatsapp-chat/hooks/useWhatsAppBridge';
import { useContact } from '@/whatsapp-chat/hooks/useContact';
import { useCloseCalls } from '@/whatsapp-chat/hooks/useCloseCalls';
import { useCloseOpportunities } from '@/whatsapp-chat/hooks/useCloseOpportunities';
import { useMopSummary } from '@/whatsapp-chat/hooks/useMopSummary';
import { useMopDetails } from '@/whatsapp-chat/hooks/useMopDetails';
import { useStrukturanalyse, type SaResult } from '@/whatsapp-chat/hooks/useStrukturanalyse';
import { type WaConversation } from '@/whatsapp-chat/types/WhatsAppTypes';
import { formatPhoneNumber } from '@/whatsapp-chat/utils/formatPhoneNumber';

const ReactMarkdown = lazy(() => import('react-markdown'));

// ── Styled components ───────────────────────────────────────────

const StyledContainer = styled.div`
  background: #F5F6F8;
  border-left: 1px solid #D1D5DB;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 440px;
  width: 440px;
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
  background: #fafafa;
  border-bottom: 1px solid #D1D5DB;
  display: flex;
  gap: 0;
  overflow-x: auto;
  scrollbar-width: thin;
`;

const StyledTab = styled.button<{ isActive: boolean }>`
  background: ${({ isActive }) => (isActive ? 'white' : 'transparent')};
  border: none;
  border-bottom: 3px solid
    ${({ isActive }) =>
      isActive ? '#075E54' : 'transparent'};
  color: ${({ isActive }) =>
    isActive ? '#075E54' : '#6B7280'};
  cursor: pointer;
  flex: 0 0 auto;
  font-family: inherit;
  font-size: 13px;
  font-weight: ${({ isActive }) => (isActive ? 600 : 500)};
  padding: 12px 16px;
  transition: all 120ms ease;
  white-space: nowrap;

  &:hover {
    color: ${({ isActive }) => (isActive ? '#075E54' : '#374151')};
  }
`;

const StyledBody = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  min-height: 0;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing(3)};
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
  flex-shrink: 0;
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

const StyledProfileCard = styled.div`
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  gap: 0;
  overflow: hidden;
`;

const StyledProfileCardRow = styled.div`
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;

  & + & {
    border-top: 1px solid #F3F4F6;
  }
`;

const StyledProfileCardLabel = styled.span`
  color: #9CA3AF;
  flex-shrink: 0;
  font-size: 12px;
  line-height: 1.6;
`;

const StyledProfileCardValue = styled.span`
  color: #111827;
  font-size: 13px;
  text-align: right;
  word-break: break-word;
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

// ── SA styled components ────────────────────────────────────────

const StyledSaIntro = styled.p`
  color: #6B7280;
  font-size: 12px;
  line-height: 1.5;
  margin: 0;
`;

const StyledSaCard = styled.div`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
`;

const StyledSaCardHeader = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  gap: 8px;
  padding: 10px 12px;
  user-select: none;

  &:hover {
    background: #f3f4f6;
  }
`;

const StyledSaChevron = styled.span<{ expanded: boolean }>`
  color: #9ca3af;
  display: inline-flex;
  font-size: 12px;
  transform: rotate(${({ expanded }) => (expanded ? '90deg' : '0deg')});
  transition: transform 0.15s ease;
`;

const StyledSaCardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 12px 12px;
`;

const StyledSaImagesRow = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
`;

const StyledSaImageWrapper = styled.div`
  border-radius: 6px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  position: relative;
`;

const StyledSaImage = styled.img`
  background: #f9fafb;
  display: block;
  max-height: 180px;
  object-fit: contain;
  width: 100%;
`;

const StyledSaImageLabel = styled.span`
  background: rgba(0, 0, 0, 0.7);
  border-radius: 4px;
  color: white;
  font-size: 9px;
  font-weight: 600;
  left: 4px;
  padding: 2px 6px;
  position: absolute;
  top: 4px;
`;

const StyledSaStatusBadge = styled.span<{
  saStatus: 'success' | 'failed' | 'invalid' | 'pending';
}>`
  border-radius: 10px;
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  width: fit-content;
  ${({ saStatus }) => {
    switch (saStatus) {
      case 'success':
        return 'background: #dcfce7; color: #16a34a;';
      case 'failed':
        return 'background: #fee2e2; color: #dc2626;';
      case 'invalid':
        return 'background: #fef3c7; color: #d97706;';
      default:
        return 'background: #f3f4f6; color: #6b7280;';
    }
  }}
`;

const StyledSaButtonsRow = styled.div`
  display: flex;
  gap: 8px;
  width: 100%;
`;

const StyledSaSendOriginal = styled.button`
  align-items: center;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  color: #374151;
  cursor: pointer;
  display: flex;
  flex: 1;
  font-family: inherit;
  font-size: 12px;
  font-weight: 500;
  gap: 6px;
  justify-content: center;
  padding: 8px 12px;
  transition: background 0.2s;

  &:hover {
    background: #e5e7eb;
  }

  &:disabled {
    cursor: default;
    opacity: 0.5;
  }
`;

const StyledSaSendAnalyzed = styled.button`
  align-items: center;
  background: #075e54;
  border: 1px solid #075e54;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  display: flex;
  flex: 1;
  font-family: inherit;
  font-size: 12px;
  font-weight: 500;
  gap: 6px;
  justify-content: center;
  padding: 8px 12px;
  transition: background 0.2s;

  &:hover {
    background: #064e46;
  }

  &:disabled {
    cursor: default;
    opacity: 0.5;
  }
`;

const StyledSaInterpretation = styled.div`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
`;

const StyledSaInterpretationHeader = styled.div`
  align-items: center;
  background: #f3f4f6;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
`;

const StyledSaInterpretationTitle = styled.span`
  color: #374151;
  font-size: 13px;
  font-weight: 600;
`;

const StyledSaCopyButton = styled.button`
  align-items: center;
  background: none;
  border: none;
  border-radius: 4px;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  font-size: 18px;
  justify-content: center;
  min-height: 28px;
  min-width: 28px;
  padding: 4px;
  transition: background 0.2s;

  &:hover {
    background: #e5e7eb;
  }
`;

const StyledSaInterpretationBody = styled.div`
  color: #4b5563;
  font-size: 13px;
  line-height: 1.5;
  max-height: 200px;
  overflow-y: auto;
  padding: 12px;

  h1, h2, h3, h4 {
    color: #111827;
    margin: 8px 0 4px;
    &:first-child { margin-top: 0; }
  }
  h1 { font-size: 16px; }
  h2 { font-size: 15px; }
  h3 { font-size: 14px; }
  h4 { font-size: 13px; }
  p { margin: 0 0 6px; }
  ul, ol { margin: 4px 0 8px; padding-left: 20px; }
  li { margin-bottom: 2px; }
  strong { color: #111827; }
  code {
    background: #f3f4f6;
    border-radius: 3px;
    font-size: 12px;
    padding: 1px 4px;
  }
  blockquote {
    border-left: 3px solid #d1d5db;
    color: #6b7280;
    font-style: italic;
    margin: 4px 0;
    padding-left: 10px;
  }
`;

const StyledSaTimestamp = styled.span`
  color: #6b7280;
  font-family: monospace;
  font-size: 11px;
`;

const StyledSaErrorBox = styled.div<{ variant: 'warning' | 'error' }>`
  align-items: flex-start;
  border-radius: 6px;
  display: flex;
  font-size: 11px;
  gap: 6px;
  max-width: 280px;
  padding: 6px 8px;
  ${({ variant }) =>
    variant === 'warning'
      ? 'background: #fef3c7; border: 1px solid #fde047; color: #92400e;'
      : 'background: #fee2e2; border: 1px solid #fca5a5; color: #991b1b;'}
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

type TabId = 'sa' | 'videos' | 'profile' | 'calls' | 'keyfacts';

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

// ── SA Tab Component ────────────────────────────────────────────

const getSaStatus = (
  result: SaResult,
): 'success' | 'failed' | 'invalid' | 'pending' => {
  const s = (result.status || '').toLowerCase();
  if (s === 'completed' || s === 'success') return 'success';
  if (s === 'invalid' || s === 'invalid input' || s === 'invalid_input')
    return 'invalid';
  if (s === 'failed' || s === 'error') return 'failed';
  return 'pending';
};

const getSaStatusLabel = (saStatus: string): string => {
  switch (saStatus) {
    case 'success':
      return 'Success';
    case 'invalid':
      return 'Invalid Input';
    case 'failed':
      return 'Failed';
    default:
      return 'Pending';
  }
};

const formatSaDate = (iso: string): string => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

type SaTabContentProps = {
  results: SaResult[];
  loading: boolean;
  conversation: WaConversation;
  sendImage: (params: {
    runId: string;
    sessionName: string;
    toJid: string;
    conversationId: string;
    caption?: string;
  }) => Promise<boolean>;
  getFullResult: (pictureId: string) => Promise<SaResult | null>;
};

const SaTabContent = ({
  results,
  loading,
  conversation,
  sendImage,
  getFullResult,
}: SaTabContentProps) => {
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(5);
  const [fullResults, setFullResults] = useState<Record<string, SaResult>>({});
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const fetchedRef = useRef<Set<string>>(new Set());

  // Auto-fetch full details for completed results missing image/text
  useEffect(() => {
    results.forEach((r) => {
      const id = r.run_id || r.picture_id || '';
      if (!id) return;
      const status = getSaStatus(r);
      if (
        status === 'success' &&
        !r.annotated_image_b64 &&
        !fetchedRef.current.has(id)
      ) {
        fetchedRef.current.add(id);
        getFullResult(id).then((full) => {
          if (full) {
            setFullResults((prev) => ({ ...prev, [id]: full }));
          }
        });
      }
    });
  }, [results, getFullResult]);

  const handleSend = useCallback(
    async (result: SaResult, type: 'input' | 'output') => {
      const runId = result.run_id || result.picture_id || '';
      setSendingId(`${runId}-${type}`);
      await sendImage({
        runId,
        sessionName: conversation.sessionName,
        toJid: conversation.leadPhoneNumber,
        conversationId: conversation.id,
        caption: type === 'output' ? 'Strukturanalyse' : undefined,
        imageType: type === 'input' ? 'original' : 'annotated',
      });
      setSendingId(null);
    },
    [sendImage, conversation],
  );

  const handleCopy = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  if (loading && results.length === 0) {
    return (
      <StyledSection>
        <StyledLoadingText>Loading structure analyses...</StyledLoadingText>
      </StyledSection>
    );
  }

  if (results.length === 0) {
    return (
      <StyledSection>
        <StyledSectionTitle>Struktur Analyse</StyledSectionTitle>
        <StyledSaIntro>
          Body posture analysis images. When leads send body photos for posture
          assessment, our AI analyzes them and generates annotated results. You
          can view and re-send both original and analyzed images.
        </StyledSaIntro>
        <StyledEmptyState>
          No structure analyses for this conversation
        </StyledEmptyState>
      </StyledSection>
    );
  }

  const visible = results.slice(0, displayCount);
  const remaining = results.length - displayCount;

  return (
    <>
      <StyledSection>
        <StyledSectionTitle>Struktur Analyse</StyledSectionTitle>
        <StyledSaIntro>
          Body posture analysis images. When leads send body photos for posture
          assessment, our AI analyzes them and generates annotated results. You
          can view and re-send both original and analyzed images.
        </StyledSaIntro>
      </StyledSection>

      {visible.map((rawResult) => {
        const runId = rawResult.run_id || rawResult.picture_id || '';
        const result = fullResults[runId] ?? rawResult;
        const saStatus = getSaStatus(result);
        const hasOutput =
          saStatus === 'success' && !!result.annotated_image_b64;
        const isExpanded =
          collapsed[runId] === undefined
            ? saStatus === 'success'
            : !collapsed[runId];

        return (
          <StyledSaCard key={runId}>
            <StyledSaCardHeader
              onClick={() =>
                setCollapsed((prev) => ({
                  ...prev,
                  [runId]: isExpanded,
                }))
              }
            >
              <StyledSaChevron expanded={isExpanded}>&#9654;</StyledSaChevron>
              <StyledSaTimestamp style={{ flex: 1 }}>
                {formatSaDate(result.created_at)}
              </StyledSaTimestamp>
              <StyledSaStatusBadge saStatus={saStatus}>
                {getSaStatusLabel(saStatus)}
              </StyledSaStatusBadge>
            </StyledSaCardHeader>

            {isExpanded && (
              <StyledSaCardBody>
                {result.error && (
                  <StyledSaErrorBox
                    variant={saStatus === 'invalid' ? 'warning' : 'error'}
                  >
                    {result.error}
                  </StyledSaErrorBox>
                )}

                {(result.original_image_b64 || result.annotated_image_b64) && (
                  <StyledSaImagesRow>
                    {result.original_image_b64 && (
                      <StyledSaImageWrapper>
                        <StyledSaImageLabel>Original</StyledSaImageLabel>
                        <StyledSaImage
                          src={`data:image/jpeg;base64,${result.original_image_b64}`}
                          alt="Original"
                        />
                      </StyledSaImageWrapper>
                    )}
                    {result.annotated_image_b64 && (
                      <StyledSaImageWrapper>
                        <StyledSaImageLabel>Analyzed</StyledSaImageLabel>
                        <StyledSaImage
                          src={`data:image/jpeg;base64,${result.annotated_image_b64}`}
                          alt="Analyzed"
                        />
                      </StyledSaImageWrapper>
                    )}
                  </StyledSaImagesRow>
                )}

                <StyledSaButtonsRow>
                  <StyledSaSendOriginal
                    disabled={sendingId === `${runId}-input`}
                    onClick={() => handleSend(result, 'input')}
                  >
                    {sendingId === `${runId}-input`
                      ? 'Sending...'
                      : 'Send Original'}
                  </StyledSaSendOriginal>
                  {hasOutput && (
                    <StyledSaSendAnalyzed
                      disabled={sendingId === `${runId}-output`}
                      onClick={() => handleSend(result, 'output')}
                    >
                      {sendingId === `${runId}-output`
                        ? 'Sending...'
                        : 'Send Analyzed'}
                    </StyledSaSendAnalyzed>
                  )}
                </StyledSaButtonsRow>

                {result.analysis_text && (
                  <StyledSaInterpretation>
                    <StyledSaInterpretationHeader>
                      <StyledSaInterpretationTitle>
                        Interpretation
                      </StyledSaInterpretationTitle>
                      <StyledSaCopyButton
                        onClick={() =>
                          handleCopy(result.analysis_text!, runId)
                        }
                        title="Copy to clipboard"
                      >
                        {copiedId === runId ? (
                          <IconCheck size={16} />
                        ) : (
                          <IconCopy size={16} />
                        )}
                      </StyledSaCopyButton>
                    </StyledSaInterpretationHeader>
                    <StyledSaInterpretationBody>
                      <Suspense fallback={<span>{result.analysis_text}</span>}>
                        <ReactMarkdown>{result.analysis_text}</ReactMarkdown>
                      </Suspense>
                    </StyledSaInterpretationBody>
                  </StyledSaInterpretation>
                )}
              </StyledSaCardBody>
            )}
          </StyledSaCard>
        );
      })}

      {remaining > 0 && (
        <StyledShowMore
          onClick={() => setDisplayCount((prev) => prev + 5)}
        >
          Load more ({remaining} remaining)
        </StyledShowMore>
      )}

      {remaining <= 0 && results.length > 5 && (
        <StyledEmptyState style={{ fontStyle: 'italic' }}>
          All {results.length} analyses loaded
        </StyledEmptyState>
      )}
    </>
  );
};

// ── Component ───────────────────────────────────────────────────

type ConversationDetailsProps = {
  conversation: WaConversation;
  onClose: () => void;
  onUpdate?: (id: string, updates: Partial<WaConversation>) => void;
  saRefreshRef?: React.MutableRefObject<(() => void) | null>;
};

export const ConversationDetails = ({
  conversation,
  onClose,
  onUpdate,
  saRefreshRef,
}: ConversationDetailsProps) => {
  const { bridgeFetch } = useWhatsAppBridge();
  const { contact, loading: contactLoading } = useContact(
    conversation.leadPhoneNumber,
  );
  const { calls, loading: callsLoading } = useCloseCalls(
    conversation.leadPhoneNumber,
  );
  const { opportunities } =
    useCloseOpportunities(conversation.leadPhoneNumber);
  const contactEmail = contact?.email || conversation.contactEmail || null;
  const { summary: mopSummary, loading: mopSummaryLoading } =
    useMopSummary(contactEmail);
  const { records: mopRecords, loading: mopRecordsLoading } =
    useMopDetails(contactEmail);
  const {
    results: saResults,
    loading: saLoading,
    sendImage: saSendImage,
    getFullResult: saGetFullResult,
    fetchResults: saFetchResults,
  } = useStrukturanalyse(conversation.id);
  const [activeTab, setActiveTab] = useState<TabId>('sa');
  const [mopExpanded, setMopExpanded] = useState(false);
  const [coachEmail, setCoachEmail] = useState(
    conversation.coachLeadOwnerEmail ?? '',
  );
  const [assignEmail, setAssignEmail] = useState(
    conversation.assignedToEmail ?? '',
  );

  // Allow parent to trigger SA results refresh via ref (e.g. on WebSocket event)
  useEffect(() => {
    if (saRefreshRef) {
      saRefreshRef.current = saFetchResults;
      return () => { saRefreshRef.current = null; };
    }
  }, [saRefreshRef, saFetchResults]);

  const displayName =
    contact?.fullName ||
    conversation.leadFullName ||
    conversation.whatsappName ||
    conversation.leadPhoneNumber;

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

  const handleAssignCoach = useCallback(async () => {
    const trimmedEmail = coachEmail.trim();
    if (!trimmedEmail) return;

    try {
      await bridgeFetch(`/api/v1/conversations/${conversation.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ coach_lead_owner_email: trimmedEmail }),
      });
      onUpdate?.(conversation.id, { coachLeadOwnerEmail: trimmedEmail });
    } catch {
      // Silently fail
    }
  }, [bridgeFetch, conversation.id, coachEmail, onUpdate]);

  return (
    <StyledContainer>
      <StyledHeader>
        <StyledTitle>Lead Assistant</StyledTitle>
        <StyledCloseButton onClick={onClose}>
          <IconX size={16} />
        </StyledCloseButton>
      </StyledHeader>

      <StyledTabs>
        <StyledTab
          isActive={activeTab === 'sa'}
          onClick={() => setActiveTab('sa')}
        >
          Struktur Analyse
        </StyledTab>
        <StyledTab
          isActive={activeTab === 'profile'}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </StyledTab>
        <StyledTab
          isActive={activeTab === 'videos'}
          onClick={() => setActiveTab('videos')}
        >
          Videos
        </StyledTab>
        <StyledTab
          isActive={activeTab === 'calls'}
          onClick={() => setActiveTab('calls')}
        >
          Calls{calls.length > 0 ? ` (${calls.length})` : ''}
        </StyledTab>
        <StyledTab
          isActive={activeTab === 'keyfacts'}
          onClick={() => setActiveTab('keyfacts')}
        >
          Key Facts
        </StyledTab>
      </StyledTabs>

      <StyledBody>
        {/* Name always visible */}
        <StyledContactName>{displayName}</StyledContactName>
        {conversation.leadPhoneNumber !== displayName && (
          <StyledContactSubtext>
            {formatPhoneNumber(conversation.leadPhoneNumber)}
          </StyledContactSubtext>
        )}

        {contactLoading && (
          <StyledLoadingText>Loading contact data...</StyledLoadingText>
        )}

        {/* ── SA Tab ──────────────────────────────────────── */}
        {activeTab === 'sa' && (
          <SaTabContent
            results={saResults}
            loading={saLoading}
            conversation={conversation}
            sendImage={saSendImage}
            getFullResult={saGetFullResult}
          />
        )}

        {/* ── Videos Tab ─────────────────────────────────── */}
        {activeTab === 'videos' && (
          <StyledSection>
            <StyledSectionTitle>Video Library</StyledSectionTitle>
            <StyledEmptyState>
              Video sharing coming soon
            </StyledEmptyState>
          </StyledSection>
        )}

        {/* ── Profile Tab (merged: contact, MOP, assignment, pipeline, opportunities) ── */}
        {activeTab === 'profile' && (
          <>
            <StyledSection>
              <StyledSectionTitle>Contact Info</StyledSectionTitle>
              <StyledProfileCard>
                <StyledProfileCardRow>
                  <StyledProfileCardLabel>Phone</StyledProfileCardLabel>
                  <StyledProfileCardValue>
                    {formatPhoneNumber(conversation.leadPhoneNumber)}
                  </StyledProfileCardValue>
                </StyledProfileCardRow>
                {conversation.whatsappName && (
                  <StyledProfileCardRow>
                    <StyledProfileCardLabel>WhatsApp</StyledProfileCardLabel>
                    <StyledProfileCardValue>
                      {conversation.whatsappName}
                    </StyledProfileCardValue>
                  </StyledProfileCardRow>
                )}
                {contact?.email && (
                  <StyledProfileCardRow>
                    <StyledProfileCardLabel>Email</StyledProfileCardLabel>
                    <StyledProfileCardValue>{contact.email}</StyledProfileCardValue>
                  </StyledProfileCardRow>
                )}
                {contact?.country && (
                  <StyledProfileCardRow>
                    <StyledProfileCardLabel>Country</StyledProfileCardLabel>
                    <StyledProfileCardValue>{contact.country}</StyledProfileCardValue>
                  </StyledProfileCardRow>
                )}
                {contact?.source && (
                  <StyledProfileCardRow>
                    <StyledProfileCardLabel>Source</StyledProfileCardLabel>
                    <StyledProfileCardValue>{contact.source}</StyledProfileCardValue>
                  </StyledProfileCardRow>
                )}
              </StyledProfileCard>
            </StyledSection>

            {contact && (
              <>
                <StyledSection>
                  <StyledSectionTitle>Client Status</StyledSectionTitle>
                  <StyledProfileCard>
                    <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
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
                        <StyledProfileCardRow style={{ padding: 0 }}>
                          <StyledProfileCardLabel>Bexio ID</StyledProfileCardLabel>
                          <StyledProfileCardValue>
                            {contact.bexioClientId}
                          </StyledProfileCardValue>
                        </StyledProfileCardRow>
                      )}
                    </div>
                  </StyledProfileCard>
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
                    <StyledProfileCard>
                      {contact.justusProgram && (
                        <StyledProfileCardRow>
                          <StyledProfileCardLabel>Program</StyledProfileCardLabel>
                          <StyledProfileCardValue>
                            {contact.justusProgram}
                            {contact.justusDuration
                              ? ` (${contact.justusDuration})`
                              : ''}
                          </StyledProfileCardValue>
                        </StyledProfileCardRow>
                      )}
                      {contact.closeLeadStatus && (
                        <StyledProfileCardRow>
                          <StyledProfileCardLabel>Lead Status</StyledProfileCardLabel>
                          <StyledProfileCardValue>
                            {contact.closeLeadStatus}
                          </StyledProfileCardValue>
                        </StyledProfileCardRow>
                      )}
                      {contact.closeLeadUrl && (
                        <StyledProfileCardRow>
                          <StyledProfileCardLabel>Close Link</StyledProfileCardLabel>
                          <StyledProfileCardValue>
                            <a
                              href={contact.closeLeadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: '#1A6CFF', textDecoration: 'none' }}
                            >
                              Open in Close &rarr;
                            </a>
                          </StyledProfileCardValue>
                        </StyledProfileCardRow>
                      )}
                    </StyledProfileCard>
                  </StyledSection>
                )}

                {(contact.lzrStartDate || contact.lzrEndDate) && (
                  <StyledSection>
                    <StyledSectionTitle>LZR Program</StyledSectionTitle>
                    <StyledProfileCard>
                      {contact.lzrStartDate && (
                        <StyledProfileCardRow>
                          <StyledProfileCardLabel>Start Date</StyledProfileCardLabel>
                          <StyledProfileCardValue>
                            {formatDate(contact.lzrStartDate)}
                          </StyledProfileCardValue>
                        </StyledProfileCardRow>
                      )}
                      {contact.lzrEndDate && (
                        <StyledProfileCardRow>
                          <StyledProfileCardLabel>End Date</StyledProfileCardLabel>
                          <StyledProfileCardValue>
                            {formatDate(contact.lzrEndDate)}
                          </StyledProfileCardValue>
                        </StyledProfileCardRow>
                      )}
                      {contact.lzrMonthDuration && (
                        <StyledProfileCardRow>
                          <StyledProfileCardLabel>Duration</StyledProfileCardLabel>
                          <StyledProfileCardValue>
                            {contact.lzrMonthDuration} months
                          </StyledProfileCardValue>
                        </StyledProfileCardRow>
                      )}
                    </StyledProfileCard>
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

            <StyledDivider />

            {/* ── MOP Section ── */}
            {!contactEmail && (
              <StyledEmptyState>No email for MOP lookup</StyledEmptyState>
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

            <StyledDivider />

            {/* ── Assignment Section ── */}
            <StyledSection>
              <StyledSectionTitle>Assignment</StyledSectionTitle>
              <StyledProfileCard>
                <StyledProfileCardRow>
                  <StyledProfileCardLabel>Owner</StyledProfileCardLabel>
                  <StyledProfileCardValue>
                    {contact?.tobAssignedName || conversation.assignedToName || 'Unassigned'}
                  </StyledProfileCardValue>
                </StyledProfileCardRow>
                <StyledProfileCardRow>
                  <StyledProfileCardLabel>Coach</StyledProfileCardLabel>
                  <StyledProfileCardValue>
                    {conversation.coachLeadOwnerName || 'None'}
                  </StyledProfileCardValue>
                </StyledProfileCardRow>
              </StyledProfileCard>
            </StyledSection>

            <StyledDivider />

            {/* ── Reassign Section ── */}
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
              <StyledAssignInput
                type="email"
                placeholder="Coach email..."
                value={coachEmail}
                onChange={(e) => setCoachEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAssignCoach();
                  }
                }}
                style={{ marginTop: 8 }}
              />
              <StyledAssignButton onClick={handleAssignCoach}>
                Assign Coach
              </StyledAssignButton>
            </StyledSection>

            {/* ── Opportunities Section ── */}
            {opportunities.length > 0 && (
              <>
                <StyledDivider />
                <StyledSection>
                  <StyledSectionTitle>
                    Opportunities ({opportunities.length})
                  </StyledSectionTitle>
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
                      </StyledCardMeta>
                    </StyledCard>
                  ))}
                </StyledSection>
              </>
            )}
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

        {/* ── Key Facts Tab ──────────────────────────────── */}
        {activeTab === 'keyfacts' && (
          <StyledSection>
            <StyledSectionTitle>Key Facts</StyledSectionTitle>
            <StyledEmptyState>
              AI-extracted key facts coming soon
            </StyledEmptyState>
          </StyledSection>
        )}
      </StyledBody>
    </StyledContainer>
  );
};
