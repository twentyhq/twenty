import styled from '@emotion/styled';
import { useRecoilState, useRecoilValue } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { isDebugModeState } from '@/client-config/states/isDebugModeState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { Select } from '@/ui/input/components/Select';

import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItem';
import { useLingui } from '@lingui/react/macro';
import { APP_LOCALES, isDefined } from 'twenty-shared';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';
import { logError } from '~/utils/logError';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const LocalePicker = () => {
  const { t } = useLingui();
  const [currentWorkspaceMember, setCurrentWorkspaceMember] = useRecoilState(
    currentWorkspaceMemberState,
  );
  const isDebugMode = useRecoilValue(isDebugModeState);

  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });

  const { refreshObjectMetadataItems } =
    useRefreshObjectMetadataItems('network-only');

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

  const handleLocaleChange = async (value: keyof typeof APP_LOCALES) => {
    setCurrentWorkspaceMember({
      ...currentWorkspaceMember,
      ...{ locale: value },
    });
    await updateWorkspaceMember({ locale: value });

    await dynamicActivate(value);
    await refreshObjectMetadataItems();
  };

  const localeOptions: Array<{
    label: string;
    value: (typeof APP_LOCALES)[keyof typeof APP_LOCALES];
  }> = [
    {
      label: t`English`,
      value: APP_LOCALES.en,
    },
    {
      label: t`French`,
      value: APP_LOCALES.fr,
    },
    {
      label: t`Spanish`,
      value: APP_LOCALES.es,
    },
    {
      label: t`German`,
      value: APP_LOCALES.de,
    },
    {
      label: t`Italian`,
      value: APP_LOCALES.it,
    },
    {
      label: t`Korean`,
      value: APP_LOCALES.ko,
    },
    {
      label: t`Japanese`,
      value: APP_LOCALES.ja,
    },
    {
      label: t`Portuguese — Portugal`,
      value: APP_LOCALES['pt-PT'],
    },
    {
      label: t`Portuguese — Brazil`,
      value: APP_LOCALES['pt-BR'],
    },
    {
      label: t`Chinese — Simplified`,
      value: APP_LOCALES['zh-Hans'],
    },
    {
      label: t`Chinese — Traditional`,
      value: APP_LOCALES['zh-Hant'],
    },
  ];
  if (isDebugMode) {
    localeOptions.push({
      label: t`Pseudo-English`,
      value: 'pseudo-en',
    });
  }

  return (
    <StyledContainer>
      <Select
        dropdownId="preferred-locale"
        dropdownWidthAuto
        fullWidth
        value={currentWorkspaceMember.locale}
        options={localeOptions}
        onChange={(value) =>
          handleLocaleChange(value as keyof typeof APP_LOCALES)
        }
      />
    </StyledContainer>
  );
};
