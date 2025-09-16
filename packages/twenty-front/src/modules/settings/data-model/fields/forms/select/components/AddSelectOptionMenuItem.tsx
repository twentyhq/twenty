import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { t } from '@lingui/core/macro';
import { useParams } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { SettingsPath } from 'twenty-shared/types';
import { IconPlus } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const AddSelectOptionMenuItem = ({
  name,
  hasCreateOptionPermission,
  fieldName,
  ShowDropdownCreateNewOption,
}: {
  name: string;
  hasCreateOptionPermission: boolean;
  fieldName?: string;
  ShowDropdownCreateNewOption?: boolean;
}) => {
  const navigateSettings = useNavigateSettings();
  const { objectNamePlural = '' } = useParams();

  const setNavigationMemorizedUrl = useSetRecoilState(navigationMemorizedUrlState);

  const ShowAddtOption = name.trim().length > 0 && hasCreateOptionPermission && ShowDropdownCreateNewOption;

  const handleRedirect = () => {
    if (!fieldName || !objectNamePlural) return;

    setNavigationMemorizedUrl(window.location.pathname + window.location.search);
    navigateSettings(
      SettingsPath.ObjectFieldEdit,
      { objectNamePlural, fieldName },
      undefined,
      { state: { CreateNewOption: name } },
    );
    
  };

  return (
    <>
      {ShowAddtOption ? (
        <>
          <MenuItem text={t`No option found`} accent="placeholder" disabled />
          <DropdownMenuSeparator />
          <MenuItem
            text={`Add "${name}" to options`}
            LeftIcon={IconPlus}
            onClick={handleRedirect}
          />
        </>
      ) : (
        <MenuItem text={t`No option found`} accent="placeholder" disabled />
      )}
    </>
  );
};
