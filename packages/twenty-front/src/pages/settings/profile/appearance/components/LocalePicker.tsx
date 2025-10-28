import styled from '@emotion/styled';
import { useRecoilState, useSetRecoilState } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { getDateFnsLocale } from '@/ui/field/display/utils/getDateFnsLocale.util';
import { Select } from '@/ui/input/components/Select';

import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItems';
import { useRefreshAllCoreViews } from '@/views/hooks/useRefreshAllCoreViews';
import { useLingui } from '@lingui/react/macro';
import { enUS } from 'date-fns/locale';
import { APP_LOCALES } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
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
  const setDateLocale = useSetRecoilState(dateLocaleState);

  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });

  const { refreshObjectMetadataItems } =
    useRefreshObjectMetadataItems('network-only');

  const { refreshAllCoreViews } = useRefreshAllCoreViews('network-only');

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

    const dateFnsLocale = await getDateFnsLocale(value);
    setDateLocale({
      locale: value,
      localeCatalog: dateFnsLocale || enUS,
    });

    await dynamicActivate(value);
    try {
      localStorage.setItem('locale', value);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('Failed to save locale to localStorage:', error);
    }
    await refreshObjectMetadataItems();
    await refreshAllCoreViews();
  };

  const unsortedLocaleOptions: Array<{
    label: string;
    value: (typeof APP_LOCALES)[keyof typeof APP_LOCALES];
  }> = [
    {
      label: t`Afrikaans`,
      value: APP_LOCALES['af-ZA'],
    },
    {
      label: t`Arabic`,
      value: APP_LOCALES['ar-SA'],
    },
    {
      label: t`Catalan`,
      value: APP_LOCALES['ca-ES'],
    },
    {
      label: t`Chinese — Simplified`,
      value: APP_LOCALES['zh-CN'],
    },
    {
      label: t`Chinese — Traditional`,
      value: APP_LOCALES['zh-TW'],
    },
    {
      label: t`Czech`,
      value: APP_LOCALES['cs-CZ'],
    },
    {
      label: t`Danish`,
      value: APP_LOCALES['da-DK'],
    },
    {
      label: t`Dutch`,
      value: APP_LOCALES['nl-NL'],
    },
    {
      label: t`English`,
      value: APP_LOCALES.en,
    },
    {
      label: t`Finnish`,
      value: APP_LOCALES['fi-FI'],
    },
    {
      label: t`French`,
      value: APP_LOCALES['fr-FR'],
    },
    {
      label: t`German`,
      value: APP_LOCALES['de-DE'],
    },
    {
      label: t`Greek`,
      value: APP_LOCALES['el-GR'],
    },
    {
      label: t`Hebrew`,
      value: APP_LOCALES['he-IL'],
    },
    {
      label: t`Hungarian`,
      value: APP_LOCALES['hu-HU'],
    },
    {
      label: t`Italian`,
      value: APP_LOCALES['it-IT'],
    },
    {
      label: t`Japanese`,
      value: APP_LOCALES['ja-JP'],
    },
    {
      label: t`Korean`,
      value: APP_LOCALES['ko-KR'],
    },
    {
      label: t`Norwegian`,
      value: APP_LOCALES['no-NO'],
    },
    {
      label: t`Polish`,
      value: APP_LOCALES['pl-PL'],
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
      label: t`Romanian`,
      value: APP_LOCALES['ro-RO'],
    },
    {
      label: t`Russian`,
      value: APP_LOCALES['ru-RU'],
    },
    {
      label: t`Serbian (Cyrillic)`,
      value: APP_LOCALES['sr-Cyrl'],
    },
    {
      label: t`Spanish`,
      value: APP_LOCALES['es-ES'],
    },
    {
      label: t`Swedish`,
      value: APP_LOCALES['sv-SE'],
    },
    {
      label: t`Turkish`,
      value: APP_LOCALES['tr-TR'],
    },
    {
      label: t`Ukrainian`,
      value: APP_LOCALES['uk-UA'],
    },
    {
      label: t`Vietnamese`,
      value: APP_LOCALES['vi-VN'],
    },
  ];

  if (process.env.NODE_ENV === 'development') {
    unsortedLocaleOptions.push({
      label: t`Pseudo-English`,
      value: APP_LOCALES['pseudo-en'],
    });
  }

  const localeOptions = [...unsortedLocaleOptions].sort((a, b) =>
    a.label.localeCompare(b.label),
  );

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
