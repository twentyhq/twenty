import { useObjectMetadataSelectHelpers } from '@/object-metadata/hooks/useObjectMetadataSelectHelpers';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyArray } from '@sniptt/guards';
import { useState } from 'react';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

type SettingsRolePermissionsAddObjectDropdownProps = {
  roleId: string;
  objectMetadataItems: EnrichedObjectMetadataItem[];
  onSelect: (objectMetadataId: string) => void;
};

export const SettingsRolePermissionsAddObjectDropdown = ({
  roleId,
  objectMetadataItems,
  onSelect,
}: SettingsRolePermissionsAddObjectDropdownProps) => {
  const { t } = useLingui();
  const [searchInputValue, setSearchInputValue] = useState('');
  const { getSelectIconPropsFromObjectMetadataItem } =
    useObjectMetadataSelectHelpers();

  const matchingObjectMetadataItems = objectMetadataItems.filter(
    (objectMetadataItem) =>
      objectMetadataItem.labelPlural
        .toLowerCase()
        .includes(searchInputValue.toLowerCase()),
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
          {matchingObjectMetadataItems.map((objectMetadataItem) => {
            const { Icon, iconThemeColor } =
              getSelectIconPropsFromObjectMetadataItem(objectMetadataItem);

            return (
              <Dropdown.ActionItem
                key={objectMetadataItem.id}
                startIcon={
                  <SelectOptionIcon Icon={Icon} color={iconThemeColor} />
                }
                onClick={() => onSelect(objectMetadataItem.id)}
              >
                {objectMetadataItem.labelPlural}
              </Dropdown.ActionItem>
            );
          })}
          {!isNonEmptyArray(matchingObjectMetadataItems) && (
            <Dropdown.Empty>{t`No objects found`}</Dropdown.Empty>
          )}
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
