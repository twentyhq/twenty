import styled from '@emotion/styled';
import { useRecoilState, useRecoilValue } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { isDebugModeState } from '@/client-config/states/isDebugModeState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { Select } from '@/ui/input/components/Select';

import { i18n } from '@lingui/core';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';
import { isDefined } from '~/utils/isDefined';
import { logError } from '~/utils/logError';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const LocalePicker = () => {
  const [currentWorkspaceMember, setCurrentWorkspaceMember] = useRecoilState(
    currentWorkspaceMemberState,
  );
  const isDebugMode = useRecoilValue(isDebugModeState);

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

  const handleLocaleChange = (value: string) => {
    setCurrentWorkspaceMember({
      ...currentWorkspaceMember,
      ...{ locale: value },
    });
    updateWorkspaceMember({ locale: value });

    dynamicActivate(value);
  };

  const localeOptions = [
    {
      label: 'Portuguese',
      value: 'pt',
    },
    {
      label: 'French',
      value: 'fr',
    },
    {
      label: 'German',
      value: 'de',
    },
    {
      label: 'Italian',
      value: 'it',
    },
    {
      label: 'Spanish',
      value: 'es',
    },
    {
      label: 'English',
      value: 'en',
    },
    {
      label: 'Chinese',
      value: 'zh',
    },
  ];

  if (isDebugMode) {
    localeOptions.push({
      label: 'Pseudo-English',
      value: 'pseudo-en',
    });
  }

  return (
    <StyledContainer>
      <Select
        dropdownId="preferred-locale"
        dropdownWidthAuto
        fullWidth
        value={i18n.locale}
        options={localeOptions}
        onChange={(value) => handleLocaleChange(value)}
      />
    </StyledContainer>
  );
};
