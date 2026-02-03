import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';

import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { Select } from '@/ui/input/components/Select';
import { TextInput } from '@/ui/input/components/TextInput';
import { IconUser, IconBox, useIcons } from 'twenty-ui/display';
import { type SelectOption } from 'twenty-ui/input';

import { EventLogTable } from '~/generated-metadata/graphql';
import { type EventLogFiltersState } from '~/pages/settings/security/event-logs/SettingsEventLogs';

import { EventLogDatePickerInput } from './EventLogDatePickerInput';

type EventLogFiltersProps = {
  table: EventLogTable;
  value: EventLogFiltersState;
  onChange: (filters: EventLogFiltersState) => void;
};

const StyledFiltersContainer = styled.div`
  align-items: flex-end;
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledFilterItem = styled.div`
  flex: 1;
  min-width: 200px;
  max-width: 300px;
`;

export const EventLogFilters = ({
  table,
  value,
  onChange,
}: EventLogFiltersProps) => {
  const { t } = useLingui();
  const currentWorkspaceMembers = useRecoilValue(currentWorkspaceMembersState);
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
    table === EventLogTable.PAGEVIEW ? t`Page Name` : t`Event Type`;

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
    <StyledFiltersContainer>
      <StyledFilterItem>
        <TextInput
          label={eventLabel}
          value={value.eventType ?? ''}
          onChange={handleEventTypeChange}
          placeholder={t`Filter by event`}
          fullWidth
        />
      </StyledFilterItem>

      <StyledFilterItem>
        <Select
          dropdownId="event-log-user-workspace-filter"
          label={t`Workspace Member`}
          value={value.userWorkspaceId ?? null}
          options={userWorkspaceOptions}
          onChange={handleUserWorkspaceChange}
          fullWidth
          withSearchInput
        />
      </StyledFilterItem>

      <StyledFilterItem>
        <EventLogDatePickerInput
          label={t`Start Date`}
          value={value.dateRange?.start}
          onChange={handleStartDateChange}
        />
      </StyledFilterItem>

      <StyledFilterItem>
        <EventLogDatePickerInput
          label={t`End Date`}
          value={value.dateRange?.end}
          onChange={handleEndDateChange}
        />
      </StyledFilterItem>

      {table === EventLogTable.OBJECT_EVENT && (
        <>
          <StyledFilterItem>
            <Select
              dropdownId="event-log-object-type-filter"
              label={t`Object Type`}
              value={value.objectMetadataId ?? null}
              options={objectMetadataOptions}
              onChange={handleObjectMetadataIdChange}
              fullWidth
              withSearchInput
            />
          </StyledFilterItem>

          <StyledFilterItem>
            <TextInput
              label={t`Record ID`}
              value={value.recordId ?? ''}
              onChange={handleRecordIdChange}
              placeholder={t`Filter by record ID`}
              fullWidth
            />
          </StyledFilterItem>
        </>
      )}
    </StyledFiltersContainer>
  );
};
