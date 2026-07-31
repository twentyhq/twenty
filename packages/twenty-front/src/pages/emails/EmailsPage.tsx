import { styled } from '@linaria/react';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { IconMail, IconSend, IconTrash } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { CampaignComposerFields } from '@/activities/emails/components/CampaignComposerFields';
import { useCampaignComposerState } from '@/activities/emails/hooks/useCampaignComposerState';
import { useMessageCampaignDraft } from '@/activities/emails/hooks/useMessageCampaignDraft';
import {
  useMessageCampaign,
  useMessageCampaigns,
} from '@/activities/emails/hooks/useMessageCampaigns';
import {
  type MessageCampaignDetails,
  type MessageCampaignRecipient,
  type MessageCampaignSummary,
} from '@/activities/emails/types/MessageCampaign';
import {
  formatCampaignDate,
  formatCampaignRate,
  isDraftCampaign,
} from '@/activities/emails/utils/campaignDisplay';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';

const StyledPageBody = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: auto;
`;

const StyledTabs = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  gap: ${themeCssVariables.spacing[6]};
  padding: 0 ${themeCssVariables.spacing[4]};
`;

const StyledTab = styled.button<{ isActive: boolean }>`
  background: transparent;
  border: 0;
  border-bottom: 2px solid
    ${({ isActive }) =>
      isActive ? themeCssVariables.font.color.primary : 'transparent'};
  color: ${({ isActive }) =>
    isActive
      ? themeCssVariables.font.color.primary
      : themeCssVariables.font.color.secondary};
  cursor: pointer;
  font-family: ${themeCssVariables.font.family};
  font-size: ${themeCssVariables.font.size.md};
  padding: ${themeCssVariables.spacing[3]} 0;
`;

const StyledFilters = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
`;

const StyledControl = styled.input`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.primary};
  font-family: ${themeCssVariables.font.family};
  font-size: ${themeCssVariables.font.size.sm};
  height: 32px;
  min-width: 160px;
  padding: 0 ${themeCssVariables.spacing[2]};
`;

const StyledDateFilter = styled.label`
  align-items: flex-start;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  flex-direction: column;
  font-size: ${themeCssVariables.font.size.xs};
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledSelect = styled.select`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  font-family: ${themeCssVariables.font.family};
  font-size: ${themeCssVariables.font.size.sm};
  height: 32px;
  padding: 0 ${themeCssVariables.spacing[2]};
`;

const StyledTable = styled.table`
  border-collapse: collapse;
  table-layout: fixed;
  width: 100%;

  th {
    color: ${themeCssVariables.font.color.secondary};
    font-size: ${themeCssVariables.font.size.xs};
    font-weight: ${themeCssVariables.font.weight.medium};
    padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
    text-align: left;
  }

  td {
    border-top: 1px solid ${themeCssVariables.border.color.light};
    color: ${themeCssVariables.font.color.secondary};
    font-size: ${themeCssVariables.font.size.sm};
    overflow: hidden;
    padding: ${themeCssVariables.spacing[3]};
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  tbody tr {
    cursor: pointer;
  }

  tbody tr:hover {
    background: ${themeCssVariables.background.transparent.light};
  }
`;

const StyledName = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  margin-bottom: ${themeCssVariables.spacing['0.5']};
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledMeta = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledStatus = styled.span`
  background: ${themeCssVariables.background.transparent.light};
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${themeCssVariables.font.color.secondary};
  display: inline-block;
  font-size: ${themeCssVariables.font.size.xs};
  padding: ${themeCssVariables.spacing['0.5']} ${themeCssVariables.spacing[2]};
  text-transform: lowercase;
`;

const StyledEmpty = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex: 1;
  justify-content: center;
  min-height: 240px;
`;

const StyledEditor = styled.div`
  margin: 0 auto;
  max-width: 760px;
  width: 100%;
`;

const StyledEditorFooter = styled.div`
  align-items: center;
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
`;

const StyledSaveState = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledActions = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledDetailGrid = styled.div`
  display: grid;
  flex: 1;
  grid-template-columns: 320px minmax(0, 1fr);
  min-height: 0;
`;

const StyledRecipientPanel = styled.div`
  border-right: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

const StyledRecipientTabs = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledRecipientTab = styled.button<{ isActive: boolean }>`
  background: ${({ isActive }) =>
    isActive ? themeCssVariables.background.transparent.medium : 'transparent'};
  border: 0;
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  font-size: ${themeCssVariables.font.size.xs};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
`;

const StyledRecipientList = styled.div`
  overflow: auto;
`;

const StyledRecipient = styled.button<{ isActive: boolean }>`
  background: ${({ isActive }) =>
    isActive ? themeCssVariables.background.transparent.light : 'transparent'};
  border: 0;
  border-top: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  cursor: pointer;
  padding: ${themeCssVariables.spacing[3]};
  text-align: left;
  width: 100%;
`;

const StyledPreview = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  overflow: auto;
  padding: ${themeCssVariables.spacing[5]};
`;

const StyledPreviewHeader = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledFrame = styled.iframe`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  min-height: 420px;
  width: 100%;
`;

type CampaignTab = 'messages' | 'drafts';

const campaignPath = (campaignId: string) =>
  AppPath.EmailsCampaign.replace(':campaignId', campaignId);

const CampaignList = () => {
  const navigate = useNavigate();
  const { campaigns, loading, error } = useMessageCampaigns();
  const [tab, setTab] = useState<CampaignTab>('messages');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [creator, setCreator] = useState('');
  const [sender, setSender] = useState('');
  const [createdAfter, setCreatedAfter] = useState('');
  const [sentAfter, setSentAfter] = useState('');

  const tabCampaigns = campaigns.filter((campaign) =>
    tab === 'drafts' ? isDraftCampaign(campaign) : !isDraftCampaign(campaign),
  );
  const creators = [
    ...new Set(tabCampaigns.map(({ creatorName }) => creatorName)),
  ];
  const senders = [
    ...new Set(
      tabCampaigns
        .map(({ fromAddress }) => fromAddress)
        .filter((value): value is string => value !== null),
    ),
  ];
  const statuses = [...new Set(tabCampaigns.map(({ status }) => status))];
  const filteredCampaigns = tabCampaigns.filter((campaign) => {
    const matchesSearch = (campaign.subject ?? 'Untitled campaign')
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCreated =
      createdAfter === '' || campaign.createdAt.slice(0, 10) >= createdAfter;
    const matchesSent =
      tab === 'drafts' ||
      sentAfter === '' ||
      (campaign.sentAt !== null && campaign.sentAt.slice(0, 10) >= sentAfter);

    return (
      matchesSearch &&
      (status === '' || campaign.status === status) &&
      (creator === '' || campaign.creatorName === creator) &&
      (sender === '' || campaign.fromAddress === sender) &&
      matchesCreated &&
      matchesSent
    );
  });

  return (
    <PageContainer>
      <PageHeader title="Emails" Icon={IconMail} />
      <StyledPageBody>
        <StyledTabs>
          <StyledTab
            isActive={tab === 'messages'}
            onClick={() => setTab('messages')}
          >
            Messages
          </StyledTab>
          <StyledTab
            isActive={tab === 'drafts'}
            onClick={() => setTab('drafts')}
          >
            Drafts
          </StyledTab>
        </StyledTabs>
        <StyledFilters>
          <StyledControl
            aria-label="Search campaigns"
            placeholder="Search by subject"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <StyledSelect
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">All statuses</option>
            {statuses.map((value) => (
              <option key={value} value={value}>
                {value.toLowerCase().replaceAll('_', ' ')}
              </option>
            ))}
          </StyledSelect>
          <StyledSelect
            value={creator}
            onChange={(event) => setCreator(event.target.value)}
          >
            <option value="">All creators</option>
            {creators.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </StyledSelect>
          <StyledSelect
            value={sender}
            onChange={(event) => setSender(event.target.value)}
          >
            <option value="">All senders</option>
            {senders.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </StyledSelect>
          <StyledDateFilter>
            {tab === 'drafts'
              ? 'Draft created on or after'
              : 'Campaign created on or after'}
            <StyledControl
              aria-label={
                tab === 'drafts'
                  ? 'Draft created on or after'
                  : 'Campaign created on or after'
              }
              type="date"
              value={createdAfter}
              onChange={(event) => setCreatedAfter(event.target.value)}
            />
          </StyledDateFilter>
          {tab === 'messages' && (
            <StyledDateFilter>
              Campaign sent on or after
              <StyledControl
                aria-label="Campaign sent on or after"
                type="date"
                value={sentAfter}
                onChange={(event) => setSentAfter(event.target.value)}
              />
            </StyledDateFilter>
          )}
        </StyledFilters>
        {loading && campaigns.length === 0 ? (
          <StyledEmpty>Loading campaigns…</StyledEmpty>
        ) : error ? (
          <StyledEmpty>Campaigns could not be loaded.</StyledEmpty>
        ) : filteredCampaigns.length === 0 ? (
          <StyledEmpty>
            {tab === 'drafts' ? 'No campaign drafts.' : 'No sent campaigns.'}
          </StyledEmpty>
        ) : (
          <CampaignTable
            campaigns={filteredCampaigns}
            onOpen={(campaignId) => navigate(campaignPath(campaignId))}
          />
        )}
      </StyledPageBody>
    </PageContainer>
  );
};

const CampaignTable = ({
  campaigns,
  onOpen,
}: {
  campaigns: MessageCampaignSummary[];
  onOpen: (campaignId: string) => void;
}) => (
  <StyledTable>
    <colgroup>
      <col style={{ width: '34%' }} />
      <col style={{ width: '10%' }} />
      <col style={{ width: '9%' }} />
      <col style={{ width: '9%' }} />
      <col style={{ width: '12%' }} />
      <col style={{ width: '12%' }} />
      <col style={{ width: '14%' }} />
    </colgroup>
    <thead>
      <tr>
        <th>Name</th>
        <th>Status</th>
        <th>Recipients</th>
        <th>Sent</th>
        <th>Failed</th>
        <th>Bounced</th>
        <th>Complaints</th>
      </tr>
    </thead>
    <tbody>
      {campaigns.map((campaign) => (
        <tr key={campaign.id} onClick={() => onOpen(campaign.id)}>
          <td>
            <StyledName>{campaign.subject || 'Untitled campaign'}</StyledName>
            <StyledMeta>
              {campaign.creatorName} · {campaign.listName ?? 'No list'} ·{' '}
              {formatCampaignDate(campaign.sentAt ?? campaign.updatedAt)}
            </StyledMeta>
          </td>
          <td>
            <StyledStatus>{campaign.status.replaceAll('_', ' ')}</StyledStatus>
          </td>
          <td>{campaign.recipientCount}</td>
          <td>{campaign.sentCount}</td>
          <td>
            {formatCampaignRate(campaign.failedCount, campaign.recipientCount)}
          </td>
          <td>
            {formatCampaignRate(campaign.bouncedCount, campaign.recipientCount)}
          </td>
          <td>
            {formatCampaignRate(
              campaign.complainedCount,
              campaign.recipientCount,
            )}
          </td>
        </tr>
      ))}
    </tbody>
  </StyledTable>
);

const CampaignEditor = ({
  campaign,
}: {
  campaign?: MessageCampaignDetails;
}) => {
  const navigate = useNavigate();
  const { deleteDraft, isDeleting } = useMessageCampaignDraft();
  const campaignState = useCampaignComposerState({
    campaignId: campaign?.id,
    initialValues: campaign
      ? {
          unsubscribeTopicId: campaign.unsubscribeTopicId,
          listId: campaign.listId,
          fromAddress: campaign.fromAddress,
          subject: campaign.subject,
          body: campaign.body,
        }
      : undefined,
    onSent: () => navigate(AppPath.Emails),
  });

  const handleClose = async () => {
    await campaignState.saveCurrentDraft();
    navigate(AppPath.Emails);
  };

  const handleDelete = async () => {
    const campaignId = campaignState.draftCampaignId;

    if (campaignId !== undefined && (await deleteDraft(campaignId))) {
      navigate(AppPath.Emails);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title={campaign?.subject || 'New campaign'}
        Icon={IconMail}
        hasClosePageButton
        onClosePage={handleClose}
      />
      <StyledPageBody>
        <StyledEditor>
          <CampaignComposerFields campaignState={campaignState} />
        </StyledEditor>
      </StyledPageBody>
      <StyledEditorFooter>
        <StyledSaveState>
          {campaignState.draftSaveStatus === 'saving'
            ? 'Saving draft…'
            : campaignState.draftSaveStatus === 'error'
              ? 'Draft could not be saved'
              : 'Draft saved automatically'}
        </StyledSaveState>
        <StyledActions>
          <Button
            size="small"
            variant="secondary"
            accent="danger"
            title="Delete draft"
            Icon={IconTrash}
            disabled={isDeleting || campaignState.draftCampaignId === undefined}
            onClick={handleDelete}
          />
          <Button
            size="small"
            variant="primary"
            accent="blue"
            title="Send campaign"
            Icon={IconSend}
            disabled={!campaignState.canSend}
            onClick={campaignState.handleSend}
          />
        </StyledActions>
      </StyledEditorFooter>
    </PageContainer>
  );
};

type RecipientStatusFilter =
  | 'ALL'
  | 'SENT'
  | 'FAILED'
  | 'BOUNCED'
  | 'COMPLAINED';

const CampaignDetail = ({ campaign }: { campaign: MessageCampaignDetails }) => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<RecipientStatusFilter>('ALL');
  const [search, setSearch] = useState('');
  const filteredRecipients = useMemo(
    () =>
      campaign.recipients.filter(
        (recipient) =>
          (status === 'ALL' || recipient.deliveryStatus === status) &&
          `${recipient.displayName} ${recipient.email}`
            .toLowerCase()
            .includes(search.toLowerCase()),
      ),
    [campaign.recipients, search, status],
  );
  const [selectedMessageId, setSelectedMessageId] = useState(
    campaign.recipients[0]?.messageId,
  );
  const selectedRecipient =
    filteredRecipients.find(
      ({ messageId }) => messageId === selectedMessageId,
    ) ?? filteredRecipients[0];
  const filters: RecipientStatusFilter[] = [
    'ALL',
    'SENT',
    'FAILED',
    'BOUNCED',
    'COMPLAINED',
  ];

  return (
    <PageContainer>
      <PageHeader
        title={campaign.subject || 'Untitled campaign'}
        Icon={IconMail}
        hasClosePageButton
        onClosePage={() => navigate(AppPath.Emails)}
      />
      <StyledDetailGrid>
        <StyledRecipientPanel>
          <StyledRecipientTabs>
            {filters.map((filter) => {
              const count =
                filter === 'ALL'
                  ? campaign.recipients.length
                  : campaign.recipients.filter(
                      ({ deliveryStatus }) => deliveryStatus === filter,
                    ).length;

              return (
                <StyledRecipientTab
                  key={filter}
                  isActive={status === filter}
                  onClick={() => setStatus(filter)}
                >
                  {filter.toLowerCase()} {count}
                </StyledRecipientTab>
              );
            })}
          </StyledRecipientTabs>
          <StyledFilters>
            <StyledControl
              aria-label="Search recipients"
              placeholder="Search recipients"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </StyledFilters>
          <StyledRecipientList>
            {filteredRecipients.map((recipient) => (
              <RecipientRow
                key={recipient.messageId}
                recipient={recipient}
                isActive={recipient.messageId === selectedRecipient?.messageId}
                onClick={() => setSelectedMessageId(recipient.messageId)}
              />
            ))}
          </StyledRecipientList>
        </StyledRecipientPanel>
        <StyledPreview>
          {selectedRecipient !== undefined ? (
            <>
              <StyledName>
                {selectedRecipient.subject || campaign.subject || 'No subject'}
              </StyledName>
              <StyledPreviewHeader>
                To: {selectedRecipient.displayName} &lt;
                {selectedRecipient.email}&gt;
                <br />
                From: {campaign.fromAddress ?? 'Unknown sender'}
              </StyledPreviewHeader>
              <StyledFrame
                title={`Email to ${selectedRecipient.email}`}
                sandbox=""
                srcDoc={selectedRecipient.body ?? ''}
              />
            </>
          ) : campaign.status === 'DRAFT' ? (
            <>
              <StyledName>{campaign.subject || 'Untitled campaign'}</StyledName>
              <StyledPreviewHeader>
                Draft by {campaign.creatorName} ·{' '}
                {campaign.listName ?? 'No list selected'}
              </StyledPreviewHeader>
              <StyledFrame
                title="Campaign draft preview"
                sandbox=""
                srcDoc={campaign.body ?? ''}
              />
            </>
          ) : (
            <StyledEmpty>No recipients match this filter.</StyledEmpty>
          )}
        </StyledPreview>
      </StyledDetailGrid>
    </PageContainer>
  );
};

const RecipientRow = ({
  recipient,
  isActive,
  onClick,
}: {
  recipient: MessageCampaignRecipient;
  isActive: boolean;
  onClick: () => void;
}) => (
  <StyledRecipient isActive={isActive} onClick={onClick}>
    <StyledName>{recipient.displayName}</StyledName>
    <StyledMeta>
      {recipient.email} · {recipient.deliveryStatus.toLowerCase()}
    </StyledMeta>
  </StyledRecipient>
);

const ExistingCampaignPage = ({ campaignId }: { campaignId: string }) => {
  const { campaign, loading, error } = useMessageCampaign(campaignId);

  if (loading && campaign === undefined) {
    return <StyledEmpty>Loading campaign…</StyledEmpty>;
  }

  if (error || campaign === undefined) {
    return <StyledEmpty>Campaign could not be loaded.</StyledEmpty>;
  }

  if (isDraftCampaign(campaign)) {
    return campaign.canEdit ? (
      <CampaignEditor campaign={campaign} />
    ) : (
      <CampaignDetail campaign={campaign} />
    );
  }

  return <CampaignDetail campaign={campaign} />;
};

export const EmailsPage = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const { pathname } = useLocation();

  if (campaignId !== undefined) {
    return <ExistingCampaignPage campaignId={campaignId} />;
  }

  if (pathname === AppPath.EmailsNew) {
    return <CampaignEditor />;
  }

  return <CampaignList />;
};
