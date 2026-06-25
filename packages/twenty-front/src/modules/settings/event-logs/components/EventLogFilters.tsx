import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type EventLogFiltersState } from '@/settings/event-logs/types/EventLogFiltersState';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { Select } from '@/ui/input/components/Select';
import { TextInput } from '@/ui/input/components/TextInput';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconBox, IconUser, useIcons } from 'twenty-ui/icon';
import { type SelectOption } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { EventLogTable } from '~/generated-metadata/graphql';

import { EventLogDatePickerInput } from './EventLogDatePickerInput';

type EventLogFiltersProps = {
  table: EventLogTable;
  value: EventLogFiltersState;
  onChange: (filters: EventLogFiltersState) => void;
};

const StyledFiltersGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
  grid-template-columns: 1fr 1fr;
`;

const StyledFullWidthField = styled.div`
  grid-column: 1 / -1;
`;

const StyledPeriodRow = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[4]};
  grid-template-columns: 1fr 1fr;
`;

export const EventLogFilters = ({
  table,
  value,
  onChange,
}: EventLogFiltersProps) => {
  const { t } = useLingui();
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const { objectMetadataItems } = useObjectMetadataItems();
  const { getIcon } = useIcons();

  const handleEventTypeChange = (eventType: string) => {
    onChange({ ...value, eventType: eventType || undefined });
  };

  const handleUserWorkspaceChange = (userWorkspaceId: string | null) => {
    onChange({ ...value, userWorkspaceId: userWorkspaceId || undefined });
  };

  const handleStartDateChange = (date: Date | undefined) => {
    onChange({
      ...value,
      dateRange: {
        ...value.dateRange,
        start: date,
      },
    });
  };

  const handleEndDateChange = (date: Date | undefined) => {
    onChange({
      ...value,
      dateRange: {
        ...value.dateRange,
        end: date,
      },
    });
  };

  const handleRecordIdChange = (recordId: string) => {
    onChange({ ...value, recordId: recordId || undefined });
  };

  const handleObjectMetadataIdChange = (objectMetadataId: string | null) => {
    onChange({ ...value, objectMetadataId: objectMetadataId || undefined });
  };

  const eventLabel =
    table === EventLogTable.PAGEVIEW ? t`Page name` : t`Event type`;

  const userWorkspaceOptions: SelectOption<string | null>[] = [
    { label: t`All Members`, value: null, Icon: IconUser },
    ...currentWorkspaceMembers
      .filter((member) => member.userWorkspaceId)
      .map((workspaceMember) => ({
        label:
          `${workspaceMember.name.firstName ?? ''} ${workspaceMember.name.lastName ?? ''}`.trim(),
        value: workspaceMember.userWorkspaceId as string,
        Icon: IconUser,
      })),
  ];

  const objectMetadataOptions: SelectOption<string | null>[] = [
    { label: t`All Objects`, value: null, Icon: IconBox },
    ...objectMetadataItems.map((item) => ({
      label: item.labelPlural,
      value: item.id,
      Icon: getIcon(item.icon) ?? IconBox,
    })),
  ];

  return (
    <StyledFiltersGrid>
      <TextInput
        label={eventLabel}
        value={value.eventType ?? ''}
        onChange={handleEventTypeChange}
        placeholder={t`Filter by event`}
        fullWidth
      />

      <Select
        dropdownId="event-log-user-workspace-filter"
        label={t`Workspace members`}
        value={value.userWorkspaceId ?? null}
        options={userWorkspaceOptions}
        onChange={handleUserWorkspaceChange}
        fullWidth
        withSearchInput
      />

      <StyledFullWidthField>
        <InputLabel>{t`Period`}</InputLabel>
        <StyledPeriodRow>
          <EventLogDatePickerInput
            instanceId="event-log-start-date"
            value={value.dateRange?.start}
            onChange={handleStartDateChange}
            placeholder={t`Start date`}
          />
          <EventLogDatePickerInput
            instanceId="event-log-end-date"
            value={value.dateRange?.end}
            onChange={handleEndDateChange}
            placeholder={t`End date`}
          />
        </StyledPeriodRow>
      </StyledFullWidthField>

      {table === EventLogTable.OBJECT_EVENT && (
        <>
          <Select
            dropdownId="event-log-object-type-filter"
            label={t`Object type`}
            value={value.objectMetadataId ?? null}
            options={objectMetadataOptions}
            onChange={handleObjectMetadataIdChange}
            fullWidth
            withSearchInput
          />

          <TextInput
            label={t`Record ID`}
            value={value.recordId ?? ''}
            onChange={handleRecordIdChange}
            placeholder={t`Filter by record ID`}
            fullWidth
          />
        </>
      )}
    </StyledFiltersGrid>
  );
};
