import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useCallback, useState } from 'react';

import { CalendarEventParticipantsResponseStatus } from '@/activities/calendar/components/CalendarEventParticipantsResponseStatus';
import { type CalendarEvent } from '@/activities/calendar/types/CalendarEvent';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { RecordFieldsScopeContextProvider } from '@/object-record/record-field-list/contexts/RecordFieldsScopeContext';
import { useFieldListFieldMetadataItems } from '@/object-record/record-field-list/hooks/useFieldListFieldMetadataItems';
import {
  FieldContext,
  type RecordUpdateHook,
  type RecordUpdateHookParams,
} from '@/object-record/record-field/ui/contexts/FieldContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { RecordInlineCell } from '@/object-record/record-inline-cell/components/RecordInlineCell';
import { useIsRecordReadOnly } from '@/object-record/read-only/hooks/useIsRecordReadOnly';
import { isRecordFieldReadOnly } from '@/object-record/read-only/utils/isRecordFieldReadOnly';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { isDefined } from 'twenty-shared/utils';
import {
  AvatarOrIcon,
  Chip,
  ChipAccent,
  ChipSize,
  ChipVariant,
} from 'twenty-ui/components';
import { IconCalendarEvent } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { PropertyBox } from '@/object-record/record-inline-cell/property-box/components/PropertyBox';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';

type CalendarEventDetailsProps = {
  calendarEvent: CalendarEvent;
};

const INPUT_ID_PREFIX = 'calendar-event-details';

const StyledContainer = styled.div`
  align-items: flex-start;
  background: ${themeCssVariables.background.secondary};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[6]};
  padding: ${themeCssVariables.spacing[6]};
  width: 100%;
`;

const StyledEventChipWrapper = styled.span`
  display: inline-flex;

  & > [data-testid='chip'] {
    gap: ${themeCssVariables.spacing[2]};
    padding-left: ${themeCssVariables.spacing[2]};
    padding-right: ${themeCssVariables.spacing[2]};
  }
`;

const StyledHeader = styled.header``;

const StyledTitle = styled.h2<{ canceled?: boolean }>`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: ${themeCssVariables.spacing[0]} ${themeCssVariables.spacing[0]}
    ${themeCssVariables.spacing[2]};

  text-decoration: ${({ canceled }) => (canceled ? 'line-through' : 'none')};
`;

const StyledCreatedAt = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  width: 100%;
`;

const StyledPropertyBoxContainer = styled.div`
  height: ${themeCssVariables.spacing[6]};
  width: 100%;
`;

export const CalendarEventDetails = ({
  calendarEvent,
}: CalendarEventDetailsProps) => {
  const { t } = useLingui();
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

  const { updateOneRecord } = useUpdateOneRecord();

  const [isUpdating, setIsUpdating] = useState(false);
  const updateEntity = useCallback(
    ({ variables }: RecordUpdateHookParams) => {
      setIsUpdating(true);
      void updateOneRecord({
        objectNameSingular: CoreObjectNameSingular.CalendarEvent,
        idToUpdate: variables.where.id as string,
        updateOneRecordInput: variables.updateOneRecordInput,
      }).finally(() => setIsUpdating(false));
    },
    [updateOneRecord],
  );

  const useUpdateOneCalendarEventRecordMutation: RecordUpdateHook = () => [
    updateEntity,
    { loading: isUpdating },
  ];

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );
  const isRecordReadOnly = useIsRecordReadOnly({
    recordId: calendarEvent.id,
    objectMetadataId: objectMetadataItem.id,
  });

  const renderField = (fieldMetadataItem: FieldMetadataItem) => {
    const isReadOnly = isRecordFieldReadOnly({
      isRecordReadOnly,
      objectPermissions,
      fieldMetadataItem: {
        id: fieldMetadataItem.id,
        isUIReadOnly: fieldMetadataItem.isUIReadOnly ?? false,
      },
    });

    return (
      <StyledPropertyBoxContainer key={fieldMetadataItem.id}>
        <PropertyBox>
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
              useUpdateRecord: useUpdateOneCalendarEventRecordMutation,
              maxWidth: 300,
              isRecordFieldReadOnly: isReadOnly,
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
        </PropertyBox>
      </StyledPropertyBoxContainer>
    );
  };

  return (
    <RecordFieldsScopeContextProvider
      value={{ scopeInstanceId: INPUT_ID_PREFIX }}
    >
      <StyledContainer>
        <StyledEventChipWrapper>
          <Chip
            accent={ChipAccent.TextSecondary}
            size={ChipSize.Large}
            variant={ChipVariant.Highlighted}
            clickable={false}
            leftComponent={<AvatarOrIcon Icon={IconCalendarEvent} />}
            label={t`Event`}
          />
        </StyledEventChipWrapper>
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
