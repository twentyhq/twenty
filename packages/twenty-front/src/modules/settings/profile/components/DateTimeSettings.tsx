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
  WorkspaceMemberDateFormat,
  WorkspaceMemberTimeFormat,
} from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';
import { isEmptyObject } from '~/utils/isEmptyObject';
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

  const handleSettingsChange = (
    settingName: 'timeZone' | 'dateFormat' | 'timeFormat',
    value: string,
  ) => {
    const workspaceMember: any = {};
    const dateTime: any = {};

    switch (settingName) {
      case 'timeZone': {
        workspaceMember[settingName] = value;
        dateTime[settingName] = value === 'system' ? detectTimeZone() : value;
        break;
      }
      case 'dateFormat': {
        workspaceMember[settingName] = getWorkspaceEnumFromDateFormat(
          value as DateFormat,
        );
        dateTime[settingName] =
          (value as DateFormat) === DateFormat.SYSTEM
            ? detectDateFormat()
            : (value as DateFormat);
        break;
      }
      case 'timeFormat': {
        workspaceMember[settingName] = getWorkspaceEnumFromTimeFormat(
          value as TimeFormat,
        );
        dateTime[settingName] =
          (value as TimeFormat) === TimeFormat.SYSTEM
            ? detectTimeFormat()
            : (value as TimeFormat);
        break;
      }
    }

    if (!isEmptyObject(dateTime)) {
      setDateTimeFormat({
        ...dateTimeFormat,
        ...dateTime,
      });
    }

    if (!isEmptyObject(workspaceMember)) {
      setCurrentWorkspaceMember({
        ...currentWorkspaceMember,
        ...workspaceMember,
      });
      updateWorkspaceMember(workspaceMember);
    }
  };

  const timeZone =
    currentWorkspaceMember.timeZone === 'system'
      ? 'system'
      : dateTimeFormat.timeZone;

  const dateFormat =
    currentWorkspaceMember.dateFormat === WorkspaceMemberDateFormat.System
      ? DateFormat.SYSTEM
      : dateTimeFormat.dateFormat;

  const timeFormat =
    currentWorkspaceMember.timeFormat === WorkspaceMemberTimeFormat.System
      ? TimeFormat.SYSTEM
      : dateTimeFormat.timeFormat;

  return (
    <StyledContainer>
      <DateTimeSettingsTimeZoneSelect
        value={timeZone}
        onChange={(value) => handleSettingsChange('timeZone', value)}
      />
      <DateTimeSettingsDateFormatSelect
        value={dateFormat}
        onChange={(value) => handleSettingsChange('dateFormat', value)}
        timeZone={timeZone}
      />
      <DateTimeSettingsTimeFormatSelect
        value={timeFormat}
        onChange={(value) => handleSettingsChange('timeFormat', value)}
        timeZone={timeZone}
      />
    </StyledContainer>
  );
};
