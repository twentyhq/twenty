/* @license Enterprise */

import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { SettingsRoleRuleConditionFieldSelectFieldMenu } from '@/settings/roles/role-permissions/rule-conditions/components/SettingsRoleRuleConditionFieldSelectFieldMenu';
import { SettingsRoleRuleConditionFieldSelectSubFieldMenu } from '@/settings/roles/role-permissions/rule-conditions/components/SettingsRoleRuleConditionFieldSelectSubFieldMenu';

type SettingsRoleRuleConditionFieldSelectDropdownContentProps = {
  recordFilterId: string;
};

export const SettingsRoleRuleConditionFieldSelectDropdownContent = ({
  recordFilterId,
}: SettingsRoleRuleConditionFieldSelectDropdownContentProps) => {
  const [searchInput, setSearchInput] = useState('');
  const [subPageFieldMetadataItem, setSubPageFieldMetadataItem] =
    useState<FieldMetadataItem | null>(null);

  return (
    <>
      <Dropdown.Page id="root">
        <SettingsRoleRuleConditionFieldSelectFieldMenu
          recordFilterId={recordFilterId}
          searchInput={searchInput}
          onSearchInputChange={setSearchInput}
          onSubPageFieldMetadataItemSelect={setSubPageFieldMetadataItem}
        />
      </Dropdown.Page>
      <Dropdown.Page id="composite">
        {isDefined(subPageFieldMetadataItem) && (
          <SettingsRoleRuleConditionFieldSelectSubFieldMenu
            recordFilterId={recordFilterId}
            fieldMetadataItem={subPageFieldMetadataItem}
          />
        )}
      </Dropdown.Page>
    </>
  );
};
