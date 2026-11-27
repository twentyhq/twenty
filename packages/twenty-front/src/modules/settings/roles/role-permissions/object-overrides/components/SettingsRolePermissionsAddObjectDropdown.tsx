import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useSettingsRoleObjectOverrides } from '@/settings/roles/role-permissions/object-overrides/hooks/useSettingsRoleObjectOverrides';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconPlus, IconSettings } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

type SettingsRolePermissionsAddObjectDropdownProps = {
  roleId: string;
  objectMetadataItems: EnrichedObjectMetadataItem[];
};

export const SettingsRolePermissionsAddObjectDropdown = ({
  roleId,
  objectMetadataItems,
}: SettingsRolePermissionsAddObjectDropdownProps) => {
  const { t } = useLingui();
  const [searchInputValue, setSearchInputValue] = useState('');
  const { addObjectOverride } = useSettingsRoleObjectOverrides(roleId);

  const isSearching = isNonEmptyString(searchInputValue);

  const matchingObjectMetadataItems = objectMetadataItems.filter(
    (objectMetadataItem) =>
      objectMetadataItem.labelPlural
        .toLowerCase()
        .includes(searchInputValue.toLowerCase()),
  );

  const listedObjectMetadataItems = isSearching
    ? matchingObjectMetadataItems
    : objectMetadataItems.filter(
        (objectMetadataItem) => !objectMetadataItem.isSystem,
      );

  const systemObjectMetadataItems = objectMetadataItems.filter(
    (objectMetadataItem) => objectMetadataItem.isSystem,
  );

  const hasAdvancedSubmenu =
    !isSearching && isNonEmptyArray(systemObjectMetadataItems);

  const renderObjectItem = (objectMetadataItem: EnrichedObjectMetadataItem) => (
    <Dropdown.ActionItem
      key={objectMetadataItem.id}
      startIcon={<ObjectMetadataIcon objectMetadataItem={objectMetadataItem} />}
      onClick={() => addObjectOverride(objectMetadataItem)}
    >
      {objectMetadataItem.labelPlural}
    </Dropdown.ActionItem>
  );

  return (
    <DropdownRoot
      dropdownId={`settings-role-add-object-${roleId}`}
      type="menu"
      onOpenChange={(open) => {
        if (!open) {
          setSearchInputValue('');
        }
      }}
    >
      <Dropdown.Trigger
        render={
          <Button
            size="sm"
            variant="outline"
            startIcon={<IconPlus />}
            disabled={!isNonEmptyArray(objectMetadataItems)}
          />
        }
      >
        {t`Add object`}
      </Dropdown.Trigger>
      <DropdownContent
        width={GenericDropdownContentWidth.Large}
        align="end"
        aria-label={t`Add object`}
      >
        <Dropdown.Search
          value={searchInputValue}
          onValueChange={setSearchInputValue}
          placeholder={t`Search objects`}
          aria-label={t`Search objects`}
        />
        <Dropdown.Separator />
        <Dropdown.Section scrollable>
          {listedObjectMetadataItems.map(renderObjectItem)}
          {!isNonEmptyArray(listedObjectMetadataItems) &&
            !hasAdvancedSubmenu && (
              <Dropdown.Empty>{t`No objects found`}</Dropdown.Empty>
            )}
        </Dropdown.Section>
        {hasAdvancedSubmenu && (
          <>
            <Dropdown.Separator />
            <Dropdown.Section>
              <Dropdown.Submenu>
                <Dropdown.SubmenuTrigger startIcon={<IconSettings />}>
                  {t`Advanced`}
                </Dropdown.SubmenuTrigger>
                <Dropdown.Content
                  width={GenericDropdownContentWidth.Large}
                  aria-label={t`Advanced objects`}
                >
                  <Dropdown.Section scrollable>
                    {systemObjectMetadataItems.map(renderObjectItem)}
                  </Dropdown.Section>
                </Dropdown.Content>
              </Dropdown.Submenu>
            </Dropdown.Section>
          </>
        )}
      </DropdownContent>
    </DropdownRoot>
  );
};
