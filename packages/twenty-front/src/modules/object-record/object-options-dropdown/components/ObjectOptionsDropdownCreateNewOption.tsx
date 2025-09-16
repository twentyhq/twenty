import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { t } from '@lingui/core/macro';
import { useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { IconPlus } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const AddStyleContainer = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

export const ObjectOptionsDropdownCreateNewOption = ({
  name,
  isHasPermissionFlag,
  fieldName,
  ShowDropdownCreateNewOption = false,
}: {
  name: string;
  isHasPermissionFlag: boolean;
  fieldName: string;
  ShowDropdownCreateNewOption?: boolean;
}) => {
  const navigateSettings = useNavigateSettings();

  const { objectNamePlural = '' } = useParams();

  const ShowAddtOption =
    name.trim().length > 0 &&
    isHasPermissionFlag &&
    ShowDropdownCreateNewOption;

  const handleRedirect = () => {
    navigateSettings(
      SettingsPath.ObjectFieldEdit,
      {
        objectNamePlural,
        fieldName,
      },
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
            text={
              <div style={AddStyleContainer}>
                <IconPlus size={14} />
                Add "{name}" to options
              </div>
            }
            onClick={handleRedirect}
          />
        </>
      ) : (
        <MenuItem text={t`No option found`} accent="placeholder" disabled />
      )}
    </>
  );
};
