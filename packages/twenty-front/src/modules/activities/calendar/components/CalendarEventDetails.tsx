import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { CalendarEvent } from '@/activities/calendar/types/CalendarEvent';
import { useObjectMetadataItemOnly } from '@/object-metadata/hooks/useObjectMetadataItemOnly';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import {
  FieldContext,
  RecordUpdateHook,
  RecordUpdateHookParams,
} from '@/object-record/record-field/contexts/FieldContext';
import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { RecordInlineCell } from '@/object-record/record-inline-cell/components/RecordInlineCell';
import { PropertyBox } from '@/object-record/record-inline-cell/property-box/components/PropertyBox';
import { InlineCellHotkeyScope } from '@/object-record/record-inline-cell/types/InlineCellHotkeyScope';
import {
  Chip,
  ChipAccent,
  ChipSize,
  ChipVariant,
} from '@/ui/display/chip/components/Chip';
import { IconCalendarEvent } from '@/ui/display/icon';
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
`;

const StyledPropertyBox = styled(PropertyBox)`
  height: ${({ theme }) => theme.spacing(6)};
  padding: 0;
`;

export const CalendarEventDetails = ({
  calendarEvent,
}: CalendarEventDetailsProps) => {
  const theme = useTheme();
  const { objectMetadataItem } = useObjectMetadataItemOnly({
    objectNameSingular: CoreObjectNameSingular.CalendarEvent,
  });
  const { updateOneRecord: updateOneCalendarEvent } =
    useUpdateOneRecord<CalendarEvent>({
      objectNameSingular: CoreObjectNameSingular.CalendarEvent,
    });

  const useUpdateOneCalendarEventMutation: RecordUpdateHook = () => {
    const updateEntity = ({ variables }: RecordUpdateHookParams) =>
      updateOneCalendarEvent({
        idToUpdate: variables.where.id as string,
        updateOneRecordInput: variables.updateOneRecordInput,
      });

    return [updateEntity, { loading: false }];
  };

  const fieldsToDisplay: Partial<
    Record<
      keyof CalendarEvent,
      Partial<Pick<FieldDefinition<FieldMetadata>, 'label'>>
    >
  > = {
    startsAt: { label: 'Start Date' },
    endsAt: { label: 'End Date' },
    conferenceUri: { label: 'Meet link' },
    location: {},
    description: {},
  };
  const fieldsByName = mapArrayToObject(
    objectMetadataItem.fields,
    ({ name }) => name,
  );

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
        {Object.entries(fieldsToDisplay).map(([fieldName, fieldOverride]) => (
          <StyledPropertyBox key={fieldName}>
            <FieldContext.Provider
              value={{
                entityId: calendarEvent.id,
                recoilScopeId: `${calendarEvent.id}-${fieldName}`,
                isLabelIdentifier: false,
                fieldDefinition: formatFieldMetadataItemAsFieldDefinition({
                  field: {
                    ...fieldsByName[fieldName],
                    ...fieldOverride,
                  },
                  objectMetadataItem,
                  showLabel: true,
                  labelWidth: 72,
                }),
                useUpdateRecord: useUpdateOneCalendarEventMutation,
                hotkeyScope: InlineCellHotkeyScope.InlineCell,
              }}
            >
              <RecordInlineCell />
            </FieldContext.Provider>
          </StyledPropertyBox>
        ))}
      </StyledFields>
    </StyledContainer>
  );
};
