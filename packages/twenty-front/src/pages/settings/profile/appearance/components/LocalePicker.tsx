import { styled } from '@linaria/react';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { getDateFnsLocale } from '@/ui/field/display/utils/getDateFnsLocale';
import { Select } from '@/ui/input/components/Select';
import { useUpdateWorkspaceMemberSettings } from '@/settings/profile/hooks/useUpdateWorkspaceMemberSettings';

import { useInvalidateMetadataStore } from '@/metadata-store/hooks/useInvalidateMetadataStore';
import { useLocaleOptions } from '@/localization/hooks/useLocaleOptions';
import { useStore } from 'jotai';
import { enUS } from 'date-fns/locale';
import { type APP_LOCALES } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';
import { logError } from '~/utils/logError';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

export const LocalePicker = () => {
  const store = useStore();
  const localeOptions = useLocaleOptions();
  const [currentWorkspaceMember, setCurrentWorkspaceMember] = useAtomState(
    currentWorkspaceMemberState,
  );
  const { updateWorkspaceMemberSettings } = useUpdateWorkspaceMemberSettings();

  const { invalidateMetadataStore } = useInvalidateMetadataStore();

  const updateWorkspaceMember = async (changedFields: any) => {
    if (!currentWorkspaceMember?.id) {
      throw new Error('User is not logged in');
    }

    try {
      await updateWorkspaceMemberSettings({
        workspaceMemberId: currentWorkspaceMember.id,
        update: changedFields,
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
    const newDateLocale = {
      locale: value,
      localeCatalog: dateFnsLocale || enUS,
    };
    store.set(dateLocaleState.atom, newDateLocale);

    await dynamicActivate(value);
    try {
      localStorage.setItem('locale', value);
    } catch (error) {
      // oxlint-disable-next-line no-console
      console.log('Failed to save locale to localStorage:', error);
    }
    invalidateMetadataStore();
  };

  return (
    <StyledContainer>
      <Select
        dropdownId="preferred-locale"
        dropdownWidthAuto
        fullWidth
        withSearchInput
        value={currentWorkspaceMember.locale}
        options={localeOptions}
        onChange={(value) =>
          handleLocaleChange(value as keyof typeof APP_LOCALES)
        }
      />
    </StyledContainer>
  );
};
