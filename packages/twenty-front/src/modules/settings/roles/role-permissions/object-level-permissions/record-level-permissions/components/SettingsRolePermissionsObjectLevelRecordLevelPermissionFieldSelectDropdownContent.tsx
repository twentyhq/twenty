/* @license Enterprise */

import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { SettingsRolePermissionsObjectLevelRecordLevelPermissionFieldSelectFieldMenu } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/components/SettingsRolePermissionsObjectLevelRecordLevelPermissionFieldSelectFieldMenu';
import { SettingsRolePermissionsObjectLevelRecordLevelPermissionFieldSelectSubFieldMenu } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/components/SettingsRolePermissionsObjectLevelRecordLevelPermissionFieldSelectSubFieldMenu';

type SettingsRolePermissionsObjectLevelRecordLevelPermissionFieldSelectDropdownContentProps =
  {
    recordFilterId: string;
  };

export const SettingsRolePermissionsObjectLevelRecordLevelPermissionFieldSelectDropdownContent =
  ({
    recordFilterId,
  }: SettingsRolePermissionsObjectLevelRecordLevelPermissionFieldSelectDropdownContentProps) => {
    const [searchInput, setSearchInput] = useState('');
    const [subPageFieldMetadataItem, setSubPageFieldMetadataItem] =
      useState<FieldMetadataItem | null>(null);

    return (
      <>
        <Dropdown.Page id="root">
          <SettingsRolePermissionsObjectLevelRecordLevelPermissionFieldSelectFieldMenu
            recordFilterId={recordFilterId}
            searchInput={searchInput}
            onSearchInputChange={setSearchInput}
            onSubPageFieldMetadataItemSelect={setSubPageFieldMetadataItem}
          />
        </Dropdown.Page>
        <Dropdown.Page id="composite">
          {isDefined(subPageFieldMetadataItem) && (
            <SettingsRolePermissionsObjectLevelRecordLevelPermissionFieldSelectSubFieldMenu
              recordFilterId={recordFilterId}
              fieldMetadataItem={subPageFieldMetadataItem}
            />
          )}
        </Dropdown.Page>
      </>
    );
  };
