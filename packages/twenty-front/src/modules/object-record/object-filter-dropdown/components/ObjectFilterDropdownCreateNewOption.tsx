import { SettingsPath } from '@/types/SettingsPath';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useParams } from 'react-router-dom';
import { IconPlus } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const AddStyleContainer = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

export const ObjectFilterDropdownCreateNewOption = ({
  name,
  isHasPermissionFlag,
  fieldName,
}: {
  name: string;
  isHasPermissionFlag: boolean;
  fieldName: string;
}) => {
  const navigateSettings = useNavigateSettings();

  const { objectNamePlural = '' } = useParams();

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
      {isHasPermissionFlag ? (
        <>
          <MenuItem text="No results" />
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
        <MenuItem text="No results" />
      )}
    </>
  );
};
