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
import { getWorkspaceEnumFromDateFormat } from '@/workspace-member/utils/formatDateLabel';
import { getWorkspaceEnumFromTimeFormat } from '@/workspace-member/utils/formatTimeLabel';
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
      timeZone,
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
      dateFormat,
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
      timeFormat,
    });

    updateWorkspaceMember(workspaceMember);
  };

  return (
    <StyledContainer>
      <DateTimeSettingsTimeZoneSelect
        value={dateTimeFormat.timeZone}
        onChange={handleTimeZoneChange}
      />
      <DateTimeSettingsDateFormatSelect
        value={dateTimeFormat.dateFormat}
        onChange={handleDateFormatChange}
        timeZone={dateTimeFormat.timeZone}
      />
      <DateTimeSettingsTimeFormatSelect
        value={dateTimeFormat.timeFormat}
        onChange={handleTimeFormatChange}
        timeZone={dateTimeFormat.timeZone}
      />
    </StyledContainer>
  );
};
