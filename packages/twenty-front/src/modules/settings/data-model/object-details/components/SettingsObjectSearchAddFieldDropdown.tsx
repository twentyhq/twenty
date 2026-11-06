import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useLingui } from '@lingui/react/macro';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconPlus } from 'twenty-ui/icon';
import { useIcons } from 'twenty-ui/icon/provider';
import { Button } from 'twenty-ui/primitives/input';

const ADD_SEARCH_FIELD_DROPDOWN_ID = 'settings-object-add-search-field';

type SettingsObjectSearchAddFieldDropdownProps = {
  addableFields: EnrichedObjectMetadataItem['fields'];
  onAddField: (fieldMetadataId: string) => void;
};

export const SettingsObjectSearchAddFieldDropdown = ({
  addableFields,
  onAddField,
}: SettingsObjectSearchAddFieldDropdownProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();

  return (
    <DropdownRoot dropdownId={ADD_SEARCH_FIELD_DROPDOWN_ID} type="menu">
      <Dropdown.Trigger
        disabled={addableFields.length === 0}
        render={
          <Button
            startIcon={<IconPlus />}
            size="sm"
            disabled={addableFields.length === 0}
            variant="outline"
          >{t`Add field`}</Button>
        }
      />
      <DropdownContent align="end" sideOffset={8}>
        <Dropdown.Section scrollable>
          {addableFields.map((field) => {
            const FieldIcon = getIcon(field.icon);

            return (
              <Dropdown.ActionItem
                key={field.id}
                startIcon={<SelectOptionIcon Icon={FieldIcon} />}
                onClick={() => onAddField(field.id)}
              >
                {field.label}
              </Dropdown.ActionItem>
            );
          })}
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
