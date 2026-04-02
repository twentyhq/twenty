import { CoachingAiOverview } from '@/coaching/components/CoachingAiOverview';
import { CoachingAnamneseTab } from '@/coaching/components/CoachingAnamneseTab';
import { CoachingSessionsTab } from '@/coaching/components/CoachingSessionsTab';
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
    return <StyledEmptyText>Kein Wert</StyledEmptyText>;
  }
  return value;
};

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return null;
  try {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: 'numeric',
      month: 'short',
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
  const { appUser, customer, loading } = useCoachingCustomerDetail(customerId);
  const customerEmail = (appUser?.email as string | null) ?? null;
  const wpUserId = (appUser?.wpUserId as string | null) ?? null;
  const { subscriptions, loading: subsLoading } =
    useCoachingSubscriptions(customerEmail);

  if (loading) {
    return <StyledLoadingContainer>Wird geladen...</StyledLoadingContainer>;
  }

  if (!appUser) {
    return <StyledLoadingContainer>Benutzer nicht gefunden</StyledLoadingContainer>;
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
              Benutzer mit bestehendem Kunden verknüpfen
            </StyledActionButton>
            <StyledActionButton>
              <IconPencil size={16} />
              App-Abo-Status ändern
            </StyledActionButton>
          </StyledActionRow>

          {/* AI Overview */}
          <CoachingAiOverview
            registeredDate={appUser.registeredDate as string | null}
            email={customerEmail}
            wpUserId={wpUserId}
            subscriptions={subscriptions}
            subsLoading={subsLoading}
          />

          {/* App's Information */}
          <StyledSection>
            <StyledSectionHeader>
              <StyledSectionTitle>App-Informationen</StyledSectionTitle>
            </StyledSectionHeader>
            <StyledSectionBody>
              <StyledInfoCardGrid>
                <StyledInfoCardCell>
                  <StyledInfoLabel>App User Id</StyledInfoLabel>
                  <StyledInfoValue>
                    {renderValue(wpUserId)}
                  </StyledInfoValue>
                </StyledInfoCardCell>
                <StyledInfoCardCell>
                  <StyledInfoLabel>App User Email</StyledInfoLabel>
                  <StyledInfoValue>
                    {renderValue(customerEmail)}
                  </StyledInfoValue>
                </StyledInfoCardCell>
                <StyledInfoCardCell>
                  <StyledInfoLabel>Registrierungsdatum</StyledInfoLabel>
                  <StyledInfoValue>
                    {renderValue(
                      formatDate(appUser.registeredDate as string | null),
                    )}
                  </StyledInfoValue>
                </StyledInfoCardCell>
              </StyledInfoCardGrid>
              <StyledInfoRow>
                <StyledInfoCardCell>
                  <StyledInfoLabel>Letzter Login</StyledInfoLabel>
                  <StyledInfoValue>
                    <StyledEmptyText>Kein Wert</StyledEmptyText>
                  </StyledInfoValue>
                </StyledInfoCardCell>
                <StyledInfoCardCell>
                  <StyledInfoLabel>Aktive Programm-IDs</StyledInfoLabel>
                  <StyledInfoValue>
                    <StyledEmptyText>Kein Wert</StyledEmptyText>
                  </StyledInfoValue>
                </StyledInfoCardCell>
              </StyledInfoRow>
            </StyledSectionBody>
          </StyledSection>

          {/* Subscriptions */}
          <StyledSection>
            <StyledSectionHeader>
              <StyledSectionTitle>Abonnements</StyledSectionTitle>
              <StyledSectionButton>Abo öffnen</StyledSectionButton>
            </StyledSectionHeader>
            <StyledSectionBody>
              <StyledTable>
                <thead>
                  <tr>
                    <StyledTableHeader>Programm</StyledTableHeader>
                    <StyledTableHeader>
                      Abo-App-Status
                    </StyledTableHeader>
                    <StyledTableHeader>Startdatum</StyledTableHeader>
                    <StyledTableHeader>Enddatum</StyledTableHeader>
                    <StyledTableHeader>
                      Pausetage
                    </StyledTableHeader>
                  </tr>
                </thead>
                <tbody>
                  {subsLoading ? (
                    <tr>
                      <StyledTableCell colSpan={5}>
                        Wird geladen...
                      </StyledTableCell>
                    </tr>
                  ) : subscriptions.length === 0 ? (
                    <tr>
                      <StyledTableCell colSpan={5}>
                        <StyledEmptyText>
                          Keine Abos verknüpft
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
              <StyledSectionTitle>Kunde</StyledSectionTitle>
            </StyledSectionHeader>
            <StyledSectionBody>
              <StyledInfoCardGrid>
                <StyledInfoCardCell>
                  <StyledInfoLabel>Vollständiger Name</StyledInfoLabel>
                  <StyledInfoValue>
                    {renderValue(
                      (customer?.fullName as string | null) ??
                        (appUser.displayName as string | null),
                    )}
                  </StyledInfoValue>
                </StyledInfoCardCell>
                <StyledInfoCardCell>
                  <StyledInfoLabel>Kunden-E-Mail</StyledInfoLabel>
                  <StyledInfoValue>
                    {renderValue(
                      (customer?.email as string | null) ?? customerEmail,
                    )}
                  </StyledInfoValue>
                </StyledInfoCardCell>
                <StyledInfoCardCell>
                  <StyledInfoLabel>Telefon</StyledInfoLabel>
                  <StyledInfoValue>
                    {renderValue(customer?.phone as string | null)}
                  </StyledInfoValue>
                </StyledInfoCardCell>
              </StyledInfoCardGrid>
            </StyledSectionBody>
          </StyledSection>

          {/* Discrepancies */}
          <StyledSection>
            <StyledSectionHeader>
              <StyledSectionTitle>Abweichungen</StyledSectionTitle>
            </StyledSectionHeader>
            <StyledSectionBody>
              <StyledEmptyText>Keine Abweichungen gefunden</StyledEmptyText>
            </StyledSectionBody>
          </StyledSection>
        </StyledDetailContent>
      ) : (
        activeTab === 'Sessions Analysis' ? (
        <CoachingSessionsTab email={customerEmail} wpUserId={wpUserId} />
      ) : activeTab === 'Anamnesebogen' ? (
        <CoachingAnamneseTab email={customerEmail} wpUserId={wpUserId} />
      ) : activeTab === 'Tickets' ? (
        <CoachingTicketsTab email={customerEmail} wpUserId={wpUserId} />
      ) : (
        <StyledPlaceholder>{activeTab} — demnächst verfügbar</StyledPlaceholder>
      )
      )}
    </StyledDetailContainer>
  );
};
