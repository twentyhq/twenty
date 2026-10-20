import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { type SettingsRoleRelatedRecordsRule } from '@/settings/roles/role-permissions/object-level-permissions/related-records/types/SettingsRoleRelatedRecordsRule';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { useTheme } from 'twenty-ui/theme';

const DROPDOWN_ID = 'settings-role-permissions-related-records-add-rule';

type SettingsRolePermissionsObjectLevelRelatedRecordsAddRuleDropdownProps = {
  availableRules: SettingsRoleRelatedRecordsRule[];
  disabled: boolean;
  onAddRule: (rule: SettingsRoleRelatedRecordsRule) => void;
};

export const SettingsRolePermissionsObjectLevelRelatedRecordsAddRuleDropdown =
  ({
    availableRules,
    disabled,
    onAddRule,
  }: SettingsRolePermissionsObjectLevelRelatedRecordsAddRuleDropdownProps) => {
    const theme = useTheme();
    const [searchInput, setSearchInput] = useState('');

    const searchedRules = availableRules.filter(
      ({ childObjectMetadataItem, relationLabel }) =>
        `${childObjectMetadataItem.labelPlural} ${relationLabel}`
          .toLocaleLowerCase()
          .includes(searchInput.toLocaleLowerCase()),
    );

    return (
      <DropdownRoot dropdownId={DROPDOWN_ID} type="picker">
        <Dropdown.Trigger
          render={
            <Button
              startIcon={<IconPlus />}
              size="sm"
              variant="outline"
              disabled={disabled}
            >{t`Add rule`}</Button>
          }
        />
        <DropdownContent
          align="end"
          width={GenericDropdownContentWidth.ExtraLarge}
          aria-label={t`Select a related object`}
        >
          <Dropdown.Search
            value={searchInput}
            onValueChange={setSearchInput}
            placeholder={t`Search objects`}
            aria-label={t`Search objects`}
          />
          <Dropdown.Section>
            {searchedRules.map((rule) => (
              <Dropdown.OptionItem
                key={rule.key}
                startIcon={
                  <ObjectMetadataIcon
                    objectMetadataItem={rule.childObjectMetadataItem}
                    size={theme.icon.size.md}
                    stroke={theme.icon.stroke.sm}
                  />
                }
                description={rule.relationLabel}
                closeOnSelect
                onSelect={() => onAddRule(rule)}
              >
                {rule.childObjectMetadataItem.labelPlural}
              </Dropdown.OptionItem>
            ))}
            {!isNonEmptyArray(searchedRules) && (
              <Dropdown.Empty>{t`No related objects found`}</Dropdown.Empty>
            )}
          </Dropdown.Section>
        </DropdownContent>
      </DropdownRoot>
    );
  };
