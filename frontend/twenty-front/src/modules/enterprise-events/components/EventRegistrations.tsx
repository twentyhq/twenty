import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { AttendeeData } from '../types/events.types';

const MOCK_ATTENDEES: AttendeeData[] = [
  { id: 'A1', name: 'Maria Lopez', email: 'maria@bancolombia.co', company: 'Bancolombia', registeredAt: '2026-04-01', checkedIn: true, checkedInAt: '2026-04-29T08:30:00Z' },
  { id: 'A2', name: 'Carlos Ruiz', email: 'carlos@ecopetrol.co', company: 'Ecopetrol', registeredAt: '2026-04-05', checkedIn: true, checkedInAt: '2026-04-29T08:45:00Z' },
  { id: 'A3', name: 'Sofia Garcia', email: 'sofia@avianca.co', company: 'Avianca', registeredAt: '2026-04-10', checkedIn: false },
  { id: 'A4', name: 'Pedro Gomez', email: 'pedro@isa.co', company: 'ISA Group', registeredAt: '2026-04-12', checkedIn: false },
  { id: 'A5', name: 'Ana Torres', email: 'ana@nutresa.co', company: 'Grupo Nutresa', registeredAt: '2026-04-15', checkedIn: true, checkedInAt: '2026-04-29T09:00:00Z' },
];

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[4]};
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.lg};
  color: ${themeCssVariables.font.color.primary};
  margin: 0;
`;

const StyledStats = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[4]};
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const StyledTh = styled.th`
  text-align: left;
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.tertiary};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
`;

const StyledTd = styled.td`
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
`;

const StyledCheckBadge = styled.span<{ checkedIn: boolean }>`
  padding: 2px 8px;
  border-radius: 4px;
  font-size: ${themeCssVariables.font.size.xs};
  background: ${({ checkedIn }) =>
    checkedIn ? themeCssVariables.color.turquoise : themeCssVariables.color.gray50};
  color: ${themeCssVariables.font.color.inverted};
`;

const StyledHideMobile = styled.td`
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  @media (max-width: ${MOBILE_VIEWPORT}px) { display: none; }
`;

const StyledHideMobileHeader = styled.th`
  text-align: left;
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.tertiary};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  @media (max-width: ${MOBILE_VIEWPORT}px) { display: none; }
`;

export const EventRegistrations = () => {
  useLingui();

  const checkedInCount = MOCK_ATTENDEES.filter((a) => a.checkedIn).length;

  return (
    <StyledContainer>
      <StyledTitle>{t`Event Registrations`}</StyledTitle>
      <StyledStats>
        <span>{t`Total`}: {MOCK_ATTENDEES.length}</span>
        <span>{t`Checked In`}: {checkedInCount}</span>
      </StyledStats>
      <StyledTable>
        <thead>
          <tr>
            <StyledTh>{t`Name`}</StyledTh>
            <StyledTh>{t`Company`}</StyledTh>
            <StyledTh>{t`Status`}</StyledTh>
            <StyledHideMobileHeader>{t`Email`}</StyledHideMobileHeader>
            <StyledHideMobileHeader>{t`Registered`}</StyledHideMobileHeader>
          </tr>
        </thead>
        <tbody>
          {MOCK_ATTENDEES.map((attendee) => (
            <tr key={attendee.id}>
              <StyledTd>{attendee.name}</StyledTd>
              <StyledTd>{attendee.company}</StyledTd>
              <StyledTd>
                <StyledCheckBadge checkedIn={attendee.checkedIn}>
                  {attendee.checkedIn ? t`Checked In` : t`Registered`}
                </StyledCheckBadge>
              </StyledTd>
              <StyledHideMobile>{attendee.email}</StyledHideMobile>
              <StyledHideMobile>{attendee.registeredAt}</StyledHideMobile>
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </StyledContainer>
  );
};
