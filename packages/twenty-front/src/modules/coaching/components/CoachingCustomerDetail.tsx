import { CoachingAnamneseTab } from '@/coaching/components/CoachingAnamneseTab';
import { CoachingTicketsTab } from '@/coaching/components/CoachingTicketsTab';
import { useCoachingCustomerDetail } from '@/coaching/hooks/useCoachingCustomerDetail';
import { useCoachingSubscriptions } from '@/coaching/hooks/useCoachingSubscriptions';
import styled from '@emotion/styled';
import { useState } from 'react';
import { IconLink, IconPencil } from 'twenty-ui/display';

type CoachingCustomerDetailProps = {
  customerId: string;
};

const TABS = [
  'Overview',
  'Sessions Analysis',
  'Strukturbilder',
  'Anamnesebogen',
  'Tickets',
] as const;

type TabName = (typeof TABS)[number];

// -- Layout --

const StyledDetailContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
`;

const StyledTabBar = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => `0 ${theme.spacing(4)}`};
  flex-shrink: 0;
`;

const StyledTab = styled.button<{ isActive: boolean }>`
  background: none;
  border: none;
  border-bottom: 2px solid
    ${({ isActive, theme }) => (isActive ? theme.color.blue : 'transparent')};
  color: ${({ isActive, theme }) =>
    isActive ? theme.color.blue : theme.font.color.secondary};
  cursor: pointer;
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(3)}`};

  &:hover {
    color: ${({ theme }) => theme.color.blue};
  }
`;

const StyledDetailContent = styled.div`
  flex: 1;
  padding: ${({ theme }) => theme.spacing(4)};
`;

// -- Action Buttons --

const StyledActionRow = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(3)};
  grid-template-columns: 1fr 1fr;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const StyledActionButton = styled.button`
  align-items: center;
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.primary};
  cursor: pointer;
  display: flex;
  font-size: ${({ theme }) => theme.font.size.md};
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: center;
  padding: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(4)}`};

  &:hover {
    background: ${({ theme }) => theme.background.transparent.lighter};
  }
`;

// -- Sections --

const StyledSection = styled.div`
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  overflow: hidden;
`;

const StyledSectionHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(4)}`};
`;

const StyledSectionTitle = styled.h3`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin: 0;
`;

const StyledSectionButton = styled.button`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.primary};
  cursor: pointer;
  font-size: ${({ theme }) => theme.font.size.sm};
  padding: ${({ theme }) => `${theme.spacing(1)} ${theme.spacing(3)}`};

  &:hover {
    background: ${({ theme }) => theme.background.transparent.lighter};
  }
`;

const StyledSectionBody = styled.div`
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
  padding: ${({ theme }) => `${theme.spacing(3)} ${theme.spacing(4)}`};
`;

// -- Info Card (horizontal multi-column) --

const StyledInfoCardGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(4)};
  grid-template-columns: repeat(3, 1fr);
`;

const StyledInfoRow = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(4)};
  grid-template-columns: repeat(3, 1fr);
  margin-top: ${({ theme }) => theme.spacing(3)};
`;

const StyledInfoCardCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledInfoLabel = styled.span`
  color: ${({ theme }) => theme.color.blue};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledInfoValue = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
`;

const StyledEmptyText = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  font-style: italic;
  font-size: ${({ theme }) => theme.font.size.md};
`;

// -- Table --

const StyledTable = styled.table`
  border-collapse: collapse;
  width: 100%;
`;

const StyledTableHeader = styled.th`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(3)}`};
  text-align: left;
`;

const StyledTableCell = styled.td`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  padding: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(3)}`};
`;

// -- Loading --

const StyledLoadingContainer = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(8)};
`;

// -- Tab placeholder --

const StyledPlaceholder = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.lg};
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(12)};
`;

const renderValue = (value: string | null | undefined) => {
  if (!value) {
    return <StyledEmptyText>No value</StyledEmptyText>;
  }
  return value;
};

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return null;
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export const CoachingCustomerDetail = ({
  customerId,
}: CoachingCustomerDetailProps) => {
  const [activeTab, setActiveTab] = useState<TabName>('Overview');
  const { customer, loading } = useCoachingCustomerDetail(customerId);
  const customerEmail = (customer?.email as string | null) ?? null;
  const wpUserId = (customer?.appUserId as string | null) ?? null;
  const { subscriptions, loading: subsLoading } =
    useCoachingSubscriptions(customerEmail);

  if (loading) {
    return <StyledLoadingContainer>Loading...</StyledLoadingContainer>;
  }

  if (!customer) {
    return <StyledLoadingContainer>Customer not found</StyledLoadingContainer>;
  }

  return (
    <StyledDetailContainer>
      <StyledTabBar>
        {TABS.map((tab) => (
          <StyledTab
            key={tab}
            isActive={activeTab === tab}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </StyledTab>
        ))}
      </StyledTabBar>

      {activeTab === 'Overview' ? (
        <StyledDetailContent>
          {/* Action Buttons */}
          <StyledActionRow>
            <StyledActionButton>
              <IconLink size={16} />
              Link user to existing customer
            </StyledActionButton>
            <StyledActionButton>
              <IconPencil size={16} />
              Change App Subscription&apos;s status
            </StyledActionButton>
          </StyledActionRow>

          {/* App's Information */}
          <StyledSection>
            <StyledSectionHeader>
              <StyledSectionTitle>App&apos;s Information</StyledSectionTitle>
            </StyledSectionHeader>
            <StyledSectionBody>
              <StyledInfoCardGrid>
                <StyledInfoCardCell>
                  <StyledInfoLabel>App User Id</StyledInfoLabel>
                  <StyledInfoValue>
                    {renderValue(customer.id as string)}
                  </StyledInfoValue>
                </StyledInfoCardCell>
                <StyledInfoCardCell>
                  <StyledInfoLabel>App User Email</StyledInfoLabel>
                  <StyledInfoValue>
                    {renderValue(customer.email as string | null)}
                  </StyledInfoValue>
                </StyledInfoCardCell>
                <StyledInfoCardCell>
                  <StyledInfoLabel>Registration Date</StyledInfoLabel>
                  <StyledInfoValue>
                    {renderValue(formatDate(customer.createdAt as string))}
                  </StyledInfoValue>
                </StyledInfoCardCell>
              </StyledInfoCardGrid>
              <StyledInfoRow>
                <StyledInfoCardCell>
                  <StyledInfoLabel>Last Login Date</StyledInfoLabel>
                  <StyledInfoValue>
                    <StyledEmptyText>No value</StyledEmptyText>
                  </StyledInfoValue>
                </StyledInfoCardCell>
                <StyledInfoCardCell>
                  <StyledInfoLabel>Active Program Ids</StyledInfoLabel>
                  <StyledInfoValue>
                    <StyledEmptyText>No value</StyledEmptyText>
                  </StyledInfoValue>
                </StyledInfoCardCell>
              </StyledInfoRow>
            </StyledSectionBody>
          </StyledSection>

          {/* Subscriptions */}
          <StyledSection>
            <StyledSectionHeader>
              <StyledSectionTitle>Subscriptions</StyledSectionTitle>
              <StyledSectionButton>Open Subscription</StyledSectionButton>
            </StyledSectionHeader>
            <StyledSectionBody>
              <StyledTable>
                <thead>
                  <tr>
                    <StyledTableHeader>Program</StyledTableHeader>
                    <StyledTableHeader>
                      Subscription App Status
                    </StyledTableHeader>
                    <StyledTableHeader>Start Date</StyledTableHeader>
                    <StyledTableHeader>End Date</StyledTableHeader>
                    <StyledTableHeader>
                      Subscription Pause Days
                    </StyledTableHeader>
                  </tr>
                </thead>
                <tbody>
                  {subsLoading ? (
                    <tr>
                      <StyledTableCell colSpan={5}>
                        Loading...
                      </StyledTableCell>
                    </tr>
                  ) : subscriptions.length === 0 ? (
                    <tr>
                      <StyledTableCell colSpan={5}>
                        <StyledEmptyText>
                          No subscriptions linked yet
                        </StyledEmptyText>
                      </StyledTableCell>
                    </tr>
                  ) : (
                    subscriptions.map((sub) => (
                      <tr key={sub.id}>
                        <StyledTableCell>
                          {String(sub.programName ?? '')}
                        </StyledTableCell>
                        <StyledTableCell>
                          {String(sub.subscriptionAppStatus ?? '')}
                        </StyledTableCell>
                        <StyledTableCell>
                          {formatDate(sub.startDate as string | null) ?? ''}
                        </StyledTableCell>
                        <StyledTableCell>
                          {formatDate(sub.endDate as string | null) ?? ''}
                        </StyledTableCell>
                        <StyledTableCell />
                      </tr>
                    ))
                  )}
                </tbody>
              </StyledTable>
            </StyledSectionBody>
          </StyledSection>

          {/* Customer */}
          <StyledSection>
            <StyledSectionHeader>
              <StyledSectionTitle>Customer</StyledSectionTitle>
            </StyledSectionHeader>
            <StyledSectionBody>
              <StyledInfoCardGrid>
                <StyledInfoCardCell>
                  <StyledInfoLabel>Full Name</StyledInfoLabel>
                  <StyledInfoValue>
                    {renderValue(customer.fullName as string | null)}
                  </StyledInfoValue>
                </StyledInfoCardCell>
                <StyledInfoCardCell>
                  <StyledInfoLabel>Customer Email</StyledInfoLabel>
                  <StyledInfoValue>
                    {renderValue(customer.email as string | null)}
                  </StyledInfoValue>
                </StyledInfoCardCell>
                <StyledInfoCardCell>
                  <StyledInfoLabel>Phone</StyledInfoLabel>
                  <StyledInfoValue>
                    {renderValue(customer.phone as string | null)}
                  </StyledInfoValue>
                </StyledInfoCardCell>
              </StyledInfoCardGrid>
            </StyledSectionBody>
          </StyledSection>

          {/* Discrepancies */}
          <StyledSection>
            <StyledSectionHeader>
              <StyledSectionTitle>Discrepancies</StyledSectionTitle>
            </StyledSectionHeader>
            <StyledSectionBody>
              <StyledEmptyText>No discrepancies found</StyledEmptyText>
            </StyledSectionBody>
          </StyledSection>
        </StyledDetailContent>
      ) : (
        activeTab === 'Anamnesebogen' ? (
        <CoachingAnamneseTab email={customerEmail} wpUserId={wpUserId} />
      ) : activeTab === 'Tickets' ? (
        <CoachingTicketsTab wpUserId={wpUserId} />
      ) : (
        <StyledPlaceholder>{activeTab} — coming soon</StyledPlaceholder>
      )
      )}
    </StyledDetailContainer>
  );
};
