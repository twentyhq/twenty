import styled from '@emotion/styled';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { Select } from '@/ui/input/components/Select';

import { isDefined } from '~/utils/isDefined';
import { isEmptyObject } from '~/utils/isEmptyObject';
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

  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });

  const { i18n } = useTranslation();

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
    const workspaceMember: any = {};

    workspaceMember.locale = value;
    if (!isEmptyObject(workspaceMember)) {
      setCurrentWorkspaceMember({
        ...currentWorkspaceMember,
        ...workspaceMember,
      });
      updateWorkspaceMember(workspaceMember);
    }
    i18n.changeLanguage(value);
  };

  return (
    <StyledContainer>
      <Select
        dropdownId="preferred-locale"
        dropdownWidthAuto
        fullWidth
        value={i18n.resolvedLanguage}
        options={[
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
        ]}
        onChange={(value) => handleLocaleChange(value)}
      />
    </StyledContainer>
  );
};
