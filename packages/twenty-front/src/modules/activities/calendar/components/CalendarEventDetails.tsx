import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';

import { CalendarEventParticipantsResponseStatus } from '@/activities/calendar/components/CalendarEventParticipantsResponseStatus';
import { type CalendarEvent } from '@/activities/calendar/types/CalendarEvent';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { useIsRecordReadOnly } from '@/object-record/read-only/hooks/useIsRecordReadOnly';
import { RecordFieldsScopeContextProvider } from '@/object-record/record-field-list/contexts/RecordFieldsScopeContext';
import { useFieldListFieldMetadataItems } from '@/object-record/record-field-list/hooks/useFieldListFieldMetadataItems';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { RecordInlineCell } from '@/object-record/record-inline-cell/components/RecordInlineCell';
import { PropertyBox } from '@/object-record/record-inline-cell/property-box/components/PropertyBox';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { isDefined } from 'twenty-shared/utils';
import { Chip, ChipAccent, ChipSize, ChipVariant } from 'twenty-ui/components';
import { IconCalendarEvent } from 'twenty-ui/display';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';

type CalendarEventDetailsProps = {
  calendarEvent: CalendarEvent;
};

const INPUT_ID_PREFIX = 'calendar-event-details';

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
  const { t } = useLingui();
  const theme = useTheme();
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.CalendarEvent,
  });

  const { inlineFieldMetadataItems } = useFieldListFieldMetadataItems({
    objectNameSingular: CoreObjectNameSingular.CalendarEvent,
    showRelationSections: false,
    excludeCreatedAtAndUpdatedAt: true,
  });

  const standardFieldOrder = [
    'startsAt',
    'endsAt',
    'conferenceLink',
    'location',
    'description',
  ];

  const standardFields = standardFieldOrder
    .map((fieldName) =>
      inlineFieldMetadataItems.find(
        (fieldMetadataItem) => fieldMetadataItem.name === fieldName,
      ),
    )
    .filter(isDefined);

  const customFields = inlineFieldMetadataItems.filter(
    (field) => field.isCustom && !standardFieldOrder.includes(field.name),
  );

  const { calendarEventParticipants } = calendarEvent;

  const isRecordReadOnly = useIsRecordReadOnly({
    recordId: calendarEvent.id,
    objectMetadataId: objectMetadataItem.id,
  });

  const renderField = (fieldMetadataItem: FieldMetadataItem) => (
    <StyledPropertyBox key={fieldMetadataItem.id}>
      <FieldContext.Provider
        value={{
          recordId: calendarEvent.id,
          isLabelIdentifier: false,
          fieldDefinition: formatFieldMetadataItemAsFieldDefinition({
            field: fieldMetadataItem,
            objectMetadataItem,
            showLabel: true,
            labelWidth: 72,
          }),
          useUpdateRecord: () => [() => undefined, { loading: false }],
          maxWidth: 300,
          isRecordFieldReadOnly: isRecordReadOnly,
        }}
      >
        <RecordFieldComponentInstanceContext.Provider
          value={{
            instanceId: getRecordFieldInputInstanceId({
              recordId: calendarEvent.id,
              fieldName: fieldMetadataItem.name,
              prefix: INPUT_ID_PREFIX,
            }),
          }}
        >
          <RecordInlineCell />
        </RecordFieldComponentInstanceContext.Provider>
      </FieldContext.Provider>
    </StyledPropertyBox>
  );

  return (
    <RecordFieldsScopeContextProvider
      value={{ scopeInstanceId: INPUT_ID_PREFIX }}
    >
      <StyledContainer>
        <StyledEventChip
          accent={ChipAccent.TextSecondary}
          size={ChipSize.Large}
          variant={ChipVariant.Highlighted}
          clickable={false}
          leftComponent={<IconCalendarEvent size={theme.icon.size.md} />}
          label={t`Event`}
        />
        <StyledHeader>
          <StyledTitle canceled={calendarEvent.isCanceled}>
            {calendarEvent.title}
          </StyledTitle>
          <StyledCreatedAt>
            {t`Created`}{' '}
            {beautifyPastDateRelativeToNow(
              new Date(calendarEvent.externalCreatedAt),
            )}
          </StyledCreatedAt>
        </StyledHeader>
        <StyledFields>
          {standardFields.slice(0, 2).map(renderField)}
          {calendarEventParticipants && (
            <CalendarEventParticipantsResponseStatus
              participants={calendarEventParticipants}
            />
          )}
          {standardFields.slice(2).map(renderField)}
          {customFields.map(renderField)}
        </StyledFields>
      </StyledContainer>
    </RecordFieldsScopeContextProvider>
  );
};
