/* oxlint-disable twenty/no-navigate-prefer-link */
import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { useGetIsMetadataItemCustom } from '@/object-metadata/hooks/useGetIsMetadataItemCustom';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useFilterObjectMetadataItemsWithPermissionOverride } from '@/settings/roles/role-permissions/object-level-permissions/hooks/useFilterObjectWithPermissionOverride';
import { useObjectMetadataItemsThatCanHavePermission } from '@/settings/roles/role-permissions/object-level-permissions/hooks/useObjectMetadataItemsThatCanHavePermission';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { useTheme } from 'twenty-ui/theme';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const DROPDOWN_ID = 'settings-role-permissions-add-object-rule';

type SettingsRolePermissionsObjectsAddRuleDropdownProps = {
  roleId: string;
  disabled: boolean;
  fromAgentId?: string;
};

export const SettingsRolePermissionsObjectsAddRuleDropdown = ({
  roleId,
  disabled,
  fromAgentId,
}: SettingsRolePermissionsObjectsAddRuleDropdownProps) => {
  const theme = useTheme();
  const navigateSettings = useNavigateSettings();
  const getIsMetadataItemCustom = useGetIsMetadataItemCustom();
  const [searchInput, setSearchInput] = useState('');

  const { objectMetadataItemsThatCanHavePermission } =
    useObjectMetadataItemsThatCanHavePermission();

  const { filterObjectMetadataItemsWithPermissionOverride } =
    useFilterObjectMetadataItemsWithPermissionOverride({ roleId });

  const availableObjectMetadataItems =
    objectMetadataItemsThatCanHavePermission.filter(
      (objectMetadataItem) =>
        !filterObjectMetadataItemsWithPermissionOverride(objectMetadataItem) &&
        objectMetadataItem.labelPlural
          .toLocaleLowerCase()
          .includes(searchInput.toLocaleLowerCase()),
    );

  const standardObjectMetadataItems = availableObjectMetadataItems.filter(
    (objectMetadataItem) => !getIsMetadataItemCustom(objectMetadataItem),
  );

  const customObjectMetadataItems = availableObjectMetadataItems.filter(
    (objectMetadataItem) => getIsMetadataItemCustom(objectMetadataItem),
  );

  const handleSelectObjectMetadataItem = (
    objectMetadataItem: EnrichedObjectMetadataItem,
  ) => {
    navigateSettings(
      SettingsPath.RoleObjectLevel,
      { roleId, objectMetadataId: objectMetadataItem.id },
      fromAgentId ? { fromAgent: fromAgentId } : undefined,
    );
  };

  const renderObjectMetadataItems = (
    objectMetadataItems: EnrichedObjectMetadataItem[],
  ) =>
    objectMetadataItems.map((objectMetadataItem) => (
      <Dropdown.OptionItem
        key={objectMetadataItem.id}
        startIcon={
          <ObjectMetadataIcon
            objectMetadataItem={objectMetadataItem}
            size={theme.icon.size.md}
            stroke={theme.icon.stroke.sm}
          />
        }
        onSelect={() => handleSelectObjectMetadataItem(objectMetadataItem)}
      >
        {objectMetadataItem.labelPlural}
      </Dropdown.OptionItem>
    ));

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
      <DropdownContent align="end" aria-label={t`Select an object`}>
        <Dropdown.Search
          value={searchInput}
          onValueChange={setSearchInput}
          placeholder={t`Search an object`}
          aria-label={t`Search an object`}
        />
        {isNonEmptyArray(standardObjectMetadataItems) && (
          <Dropdown.Section label={t`Standard`} scrollable>
            {renderObjectMetadataItems(standardObjectMetadataItems)}
          </Dropdown.Section>
        )}
        {isNonEmptyArray(customObjectMetadataItems) && (
          <Dropdown.Section label={t`Custom`} scrollable>
            {renderObjectMetadataItems(customObjectMetadataItems)}
          </Dropdown.Section>
        )}
        {!isNonEmptyArray(availableObjectMetadataItems) && (
          <Dropdown.Empty>{t`No objects found`}</Dropdown.Empty>
        )}
      </DropdownContent>
    </DropdownRoot>
  );
};
