import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[6]};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
`;

const StyledSection = styled.div`
  border: 1px solid ${themeCssVariables.color.border};
  border-radius: 8px;
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledSectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 ${themeCssVariables.spacing[3]} 0;
`;

const StyledFormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  margin-bottom: ${themeCssVariables.spacing[3]};
`;

const StyledLabel = styled.label`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${themeCssVariables.color.font.secondary};
`;

const StyledInput = styled.input`
  padding: 8px 12px;
  border: 1px solid ${themeCssVariables.color.border};
  border-radius: 6px;
  font-size: 0.85rem;
  background: transparent;
  color: inherit;

  &:focus {
    outline: none;
    border-color: ${themeCssVariables.color.accent};
  }
`;

const StyledSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid ${themeCssVariables.color.border};
  border-radius: 6px;
  font-size: 0.85rem;
  background: transparent;
  color: inherit;
`;

const StyledButton = styled.button<{ variant?: string }>`
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  background: ${(props) =>
    props.variant === 'danger'
      ? '#ef4444'
      : props.variant === 'secondary'
        ? themeCssVariables.color.border
        : '#3b82f6'};
  color: white;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.85;
  }
`;

const StyledStatusDot = styled.span<{ status: string }>`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
  background: ${(props) =>
    props.status === 'connected'
      ? '#10b981'
      : props.status === 'error'
        ? '#ef4444'
        : '#f59e0b'};
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: block;
    overflow-x: auto;
  }
`;

const StyledTh = styled.th`
  text-align: left;
  padding: 8px 12px;
  border-bottom: 2px solid ${themeCssVariables.color.border};
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: ${themeCssVariables.color.font.secondary};
`;

const StyledTd = styled.td`
  padding: 8px 12px;
  border-bottom: 1px solid ${themeCssVariables.color.border};
`;

const StyledFormRow = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  align-items: flex-end;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

type UpcomingEvent = {
  name: string;
  date: string;
  venue: string;
  registrations: number;
  capacity: number;
  status: string;
};

type EventTemplate = {
  name: string;
  type: string;
  defaultCapacity: number;
};

export const SettingsModuleEvents = () => {
  const { t } = useLingui();

  const [registrationMode, setRegistrationMode] = useState('open');
  const [qrCheckIn, setQrCheckIn] = useState('true');
  const [waitlistEnabled, setWaitlistEnabled] = useState('true');

  const [events] = useState<UpcomingEvent[]>([
    { name: 'Tech Summit 2026', date: '2026-06-15', venue: 'Centro de Convenciones Bogota', registrations: 320, capacity: 500, status: 'Open' },
    { name: 'Partner Meetup Q3', date: '2026-07-20', venue: 'Hotel Tequendama', registrations: 85, capacity: 100, status: 'Almost Full' },
    { name: 'Product Launch Event', date: '2026-08-05', venue: 'Virtual', registrations: 1250, capacity: 5000, status: 'Open' },
  ]);

  const [templates] = useState<EventTemplate[]>([
    { name: 'Conference', type: 'In-Person', defaultCapacity: 500 },
    { name: 'Webinar', type: 'Virtual', defaultCapacity: 1000 },
    { name: 'Workshop', type: 'Hybrid', defaultCapacity: 50 },
    { name: 'Networking Mixer', type: 'In-Person', defaultCapacity: 100 },
  ]);

  return (
    <SubMenuTopBarContainer
      title={t`Events`}
      links={[
        { children: t`Modules`, href: getSettingsPath(SettingsPath.EnterpriseModules) },
        { children: t`Events` },
      ]}
    >
      <StyledContainer>
        <StyledTitle>{t`Event Management Configuration`}</StyledTitle>

        <StyledSection>
          <StyledSectionTitle>{t`Upcoming Events`}</StyledSectionTitle>
          <StyledTable>
            <thead>
              <tr>
                <StyledTh>{t`Event`}</StyledTh>
                <StyledTh>{t`Date`}</StyledTh>
                <StyledTh>{t`Venue`}</StyledTh>
                <StyledTh>{t`Registrations`}</StyledTh>
                <StyledTh>{t`Status`}</StyledTh>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.name}>
                  <StyledTd>{event.name}</StyledTd>
                  <StyledTd>{event.date}</StyledTd>
                  <StyledTd>{event.venue}</StyledTd>
                  <StyledTd>{event.registrations}/{event.capacity}</StyledTd>
                  <StyledTd>
                    <StyledStatusDot
                      status={event.status === 'Open' ? 'connected' : 'pending'}
                    />
                    {event.status}
                  </StyledTd>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>{t`Registration Settings`}</StyledSectionTitle>
          <StyledFormRow>
            <StyledFormGroup style={{ flex: 1 }}>
              <StyledLabel>{t`Registration Mode`}</StyledLabel>
              <StyledSelect
                value={registrationMode}
                onChange={(event) => setRegistrationMode(event.target.value)}
              >
                <option value="open">{t`Open Registration`}</option>
                <option value="approval">{t`Requires Approval`}</option>
                <option value="invite">{t`Invite Only`}</option>
              </StyledSelect>
            </StyledFormGroup>
            <StyledFormGroup style={{ flex: 1 }}>
              <StyledLabel>{t`Waitlist`}</StyledLabel>
              <StyledSelect
                value={waitlistEnabled}
                onChange={(event) => setWaitlistEnabled(event.target.value)}
              >
                <option value="true">{t`Enabled`}</option>
                <option value="false">{t`Disabled`}</option>
              </StyledSelect>
            </StyledFormGroup>
          </StyledFormRow>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>{t`QR Check-In Configuration`}</StyledSectionTitle>
          <StyledFormGroup>
            <StyledLabel>{t`QR Code Check-In`}</StyledLabel>
            <StyledSelect
              value={qrCheckIn}
              onChange={(event) => setQrCheckIn(event.target.value)}
            >
              <option value="true">{t`Enabled`}</option>
              <option value="false">{t`Disabled`}</option>
            </StyledSelect>
          </StyledFormGroup>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>{t`Event Templates`}</StyledSectionTitle>
          <StyledTable>
            <thead>
              <tr>
                <StyledTh>{t`Template`}</StyledTh>
                <StyledTh>{t`Type`}</StyledTh>
                <StyledTh>{t`Default Capacity`}</StyledTh>
                <StyledTh>{t`Actions`}</StyledTh>
              </tr>
            </thead>
            <tbody>
              {templates.map((template) => (
                <tr key={template.name}>
                  <StyledTd>{template.name}</StyledTd>
                  <StyledTd>{template.type}</StyledTd>
                  <StyledTd>{template.defaultCapacity}</StyledTd>
                  <StyledTd>
                    <StyledButton variant="secondary">{t`Use Template`}</StyledButton>
                  </StyledTd>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </StyledSection>

        <StyledButton>{t`Save Settings`}</StyledButton>
      </StyledContainer>
    </SubMenuTopBarContainer>
  );
};
