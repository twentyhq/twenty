import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import {
  Chip,
  ChipAccent,
  ChipSize,
  ChipVariant,
  IconCalendarEvent,
} from 'twenty-ui';

import { CalendarEventParticipantsResponseStatus } from '@/activities/calendar/components/CalendarEventParticipantsResponseStatus';
import { CalendarEvent } from '@/activities/calendar/types/CalendarEvent';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { RecordInlineCell } from '@/object-record/record-inline-cell/components/RecordInlineCell';
import { PropertyBox } from '@/object-record/record-inline-cell/property-box/components/PropertyBox';
import { mapArrayToObject } from '~/utils/array/mapArrayToObject';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';

type CalendarEventDetailsProps = {
  calendarEvent: CalendarEvent;
};

const StyledContainer = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  align-items: flex-start;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(6)};
  padding: ${({ theme }) => theme.spacing(6)};
  width: 100%;
  box-sizing: border-box;
`;

const StyledEventChip = styled(Chip)`
  gap: ${({ theme }) => theme.spacing(2)};
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(2)};
`;

const StyledHeader = styled.header``;

const StyledTitle = styled.h2<{ canceled?: boolean }>`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin: ${({ theme }) => theme.spacing(0, 0, 2)};

  ${({ canceled }) =>
    canceled &&
    css`
      text-decoration: line-through;
    `}
`;

const StyledCreatedAt = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  width: 100%;
`;

const StyledPropertyBox = styled(PropertyBox)`
  height: ${({ theme }) => theme.spacing(6)};
  padding: 0;
  width: 100%;
`;

export const CalendarEventDetails = ({
  calendarEvent,
}: CalendarEventDetailsProps) => {
  const theme = useTheme();
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.CalendarEvent,
  });

  const fieldsToDisplay = [
    'startsAt',
    'endsAt',
    'conferenceLink',
    'location',
    'description',
  ];

  const fieldsByName = mapArrayToObject(
    objectMetadataItem.fields,
    ({ name }) => name,
  );

  const { calendarEventParticipants } = calendarEvent;

  const Fields = fieldsToDisplay.map((fieldName) => (
    <StyledPropertyBox key={fieldName}>
      <FieldContext.Provider
        value={{
          recordId: calendarEvent.id,
          hotkeyScope: 'calendar-event-details',
          recoilScopeId: `${calendarEvent.id}-${fieldName}`,
          isLabelIdentifier: false,
          fieldDefinition: formatFieldMetadataItemAsFieldDefinition({
            field: fieldsByName[fieldName],
            objectMetadataItem,
            showLabel: true,
            labelWidth: 72,
          }),
          useUpdateRecord: () => [() => undefined, { loading: false }],
          maxWidth: 300,
        }}
      >
        <RecordInlineCell readonly />
      </FieldContext.Provider>
    </StyledPropertyBox>
  ));

  return (
    <StyledContainer>
      <StyledEventChip
        accent={ChipAccent.TextSecondary}
        size={ChipSize.Large}
        variant={ChipVariant.Highlighted}
        clickable={false}
        leftComponent={<IconCalendarEvent size={theme.icon.size.md} />}
        label="Event"
      />
      <StyledHeader>
        <StyledTitle canceled={calendarEvent.isCanceled}>
          {calendarEvent.title}
        </StyledTitle>
        <StyledCreatedAt>
          Created{' '}
          {beautifyPastDateRelativeToNow(
            new Date(calendarEvent.externalCreatedAt),
          )}
        </StyledCreatedAt>
      </StyledHeader>
      <StyledFields>
        {Fields.slice(0, 2)}
        {calendarEventParticipants && (
          <CalendarEventParticipantsResponseStatus
            participants={calendarEventParticipants}
          />
        )}
        {Fields.slice(2)}
      </StyledFields>
    </StyledContainer>
  );
};
