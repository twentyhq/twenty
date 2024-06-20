import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { DateTimeSettingsDateFormatSelect } from '@/settings/profile/components/DateTimeSettingsDateFormatSelect';
import { DateTimeSettingsTimeFormatSelect } from '@/settings/profile/components/DateTimeSettingsTimeFormatSelect';
import { DateTimeSettingsTimeZoneSelect } from '@/settings/profile/components/DateTimeSettingsTimeZoneSelect';
import { DateFormat } from '@/workspace-member/constants/DateFormat';
import { TimeFormat } from '@/workspace-member/constants/TimeFormat';
import { dateTimeFormatState } from '@/workspace-member/states/dateTimeFormatState';
import { detectDateFormat } from '@/workspace-member/utils/detectDateFormat';
import { detectTimeFormat } from '@/workspace-member/utils/detectTimeFormat';
import { detectTimeZone } from '@/workspace-member/utils/detectTimeZone';
import { getWorkspaceEnumFromDateFormat } from '@/workspace-member/utils/formatDateLabel';
import { getWorkspaceEnumFromTimeFormat } from '@/workspace-member/utils/formatTimeLabel';
import {
  WorkspaceMemberDateFormatEnum,
  WorkspaceMemberTimeFormatEnum,
} from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';
import { logError } from '~/utils/logError';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const DateTimeSettings = () => {
  const [currentWorkspaceMember, setCurrentWorkspaceMember] = useRecoilState(
    currentWorkspaceMemberState,
  );
  const [dateTimeFormat, setDateTimeFormat] =
    useRecoilState(dateTimeFormatState);

  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });

  const updateWorkspaceMember = async (changedFields: any) => {
    if (!currentWorkspaceMember?.id) {
      throw new Error('User is not logged in');
    }

    try {
      await updateOneRecord({
        idToUpdate: currentWorkspaceMember.id,
        updateOneRecordInput: changedFields,
      });
    } catch (error) {
      logError(error);
    }
  };

  if (!isDefined(currentWorkspaceMember)) return;

  const handleTimeZoneChange = (timeZone: string) => {
    const workspaceMember = {
      ...currentWorkspaceMember,
      timeZone,
    };
    setCurrentWorkspaceMember(workspaceMember);

    setDateTimeFormat({
      ...dateTimeFormat,
      timeZone: timeZone === 'system' ? detectTimeZone() : timeZone,
    });

    updateWorkspaceMember(workspaceMember);
  };

  const handleDateFormatChange = (dateFormat: DateFormat) => {
    const workspaceMember = {
      ...currentWorkspaceMember,
      dateFormat: getWorkspaceEnumFromDateFormat(dateFormat),
    };

    setCurrentWorkspaceMember(workspaceMember);

    setDateTimeFormat({
      ...dateTimeFormat,
      dateFormat:
        dateFormat === DateFormat.SYSTEM ? detectDateFormat() : dateFormat,
    });

    updateWorkspaceMember(workspaceMember);
  };

  const handleTimeFormatChange = (timeFormat: TimeFormat) => {
    const workspaceMember = {
      ...currentWorkspaceMember,
      timeFormat: getWorkspaceEnumFromTimeFormat(timeFormat),
    };

    setCurrentWorkspaceMember(workspaceMember);

    setDateTimeFormat({
      ...dateTimeFormat,
      timeFormat:
        timeFormat === TimeFormat.SYSTEM ? detectTimeFormat() : timeFormat,
    });

    updateWorkspaceMember(workspaceMember);
  };

  const timeZone =
    currentWorkspaceMember.timeZone === 'system'
      ? 'system'
      : dateTimeFormat.timeZone;

  const dateFormat =
    currentWorkspaceMember.dateFormat === WorkspaceMemberDateFormatEnum.System
      ? DateFormat.SYSTEM
      : dateTimeFormat.dateFormat;

  const timeFormat =
    currentWorkspaceMember.timeFormat === WorkspaceMemberTimeFormatEnum.System
      ? TimeFormat.SYSTEM
      : dateTimeFormat.timeFormat;

  return (
    <StyledContainer>
      <DateTimeSettingsTimeZoneSelect
        value={timeZone}
        onChange={handleTimeZoneChange}
      />
      <DateTimeSettingsDateFormatSelect
        value={dateFormat}
        onChange={handleDateFormatChange}
        timeZone={timeZone}
      />
      <DateTimeSettingsTimeFormatSelect
        value={timeFormat}
        onChange={handleTimeFormatChange}
        timeZone={timeZone}
      />
    </StyledContainer>
  );
};
