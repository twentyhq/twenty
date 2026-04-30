import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { AttendeeData } from '../types/events.types';
import { GET_EVENTS_DATA } from '../hooks/useEvents';

const StyledContainer = styled.div`
  display: flex; flex-direction: column; padding: ${themeCssVariables.spacing[4]}; gap: ${themeCssVariables.spacing[2]};
`;
const StyledTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.lg}; color: ${themeCssVariables.font.color.primary}; margin: 0;
`;
const StyledStats = styled.div`
  display: flex; gap: ${themeCssVariables.spacing[4]};
  font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.secondary};
`;
const StyledTable = styled.table` width: 100%; border-collapse: collapse; `;
const StyledTh = styled.th`
  text-align: left; padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.tertiary};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
`;
const StyledTd = styled.td`
  padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.primary}; border-bottom: 1px solid ${themeCssVariables.border.color.light};
`;
const StyledCheckBadge = styled.span<{ checkedIn: boolean }>`
  padding: 2px 8px; border-radius: 4px; font-size: ${themeCssVariables.font.size.xs};
  background: ${({ checkedIn }) => checkedIn ? themeCssVariables.color.turquoise : themeCssVariables.color.gray50};
  color: ${themeCssVariables.font.color.inverted};
`;
const StyledHideMobile = styled.td`
  padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.primary}; border-bottom: 1px solid ${themeCssVariables.border.color.light};
  @media (max-width: ${MOBILE_VIEWPORT}px) { display: none; }
`;
const StyledHideMobileHeader = styled.th`
  text-align: left; padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.tertiary};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  @media (max-width: ${MOBILE_VIEWPORT}px) { display: none; }
`;

export const EventRegistrations = () => {
  useLingui();
  const { data, loading, error } = useQuery(GET_EVENTS_DATA);

  if (loading) return <StyledContainer>{t`Loading...`}</StyledContainer>;
  if (error) return <StyledContainer>{t`Error loading data`}</StyledContainer>;

  const attendees: AttendeeData[] = data?.eventsData?.attendees ?? [];
  const checkedInCount = attendees.filter((a) => a.checkedIn).length;

  return (
    <StyledContainer>
      <StyledTitle>{t`Event Registrations`}</StyledTitle>
      <StyledStats>
        <span>{t`Total`}: {attendees.length}</span>
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
          {attendees.map((attendee) => (
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
