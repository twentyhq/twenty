import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ChartSettingsDropdownSection } from '@/side-panel/pages/page-layout/components/chart-settings/ChartSettingsDropdownSection';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { Dropdown } from 'twenty-ui/components/navigation';
import { useIcons } from 'twenty-ui/icon';

type FieldWidgetNestedFieldDropdownContentProps = {
  drillInFieldMetadataItem: FieldMetadataItem;
  nestedFieldCandidates: FieldMetadataItem[];
  checkedItemId: string | undefined;
  onSelectField: (fieldMetadataItem: FieldMetadataItem) => void;
  onSelectNestedField: (selection: {
    parentFieldMetadataItem: FieldMetadataItem;
    nestedFieldMetadataItem: FieldMetadataItem;
  }) => void;
};

export const FieldWidgetNestedFieldDropdownContent = ({
  drillInFieldMetadataItem,
  nestedFieldCandidates,
  checkedItemId,
  onSelectField,
  onSelectNestedField,
}: FieldWidgetNestedFieldDropdownContentProps) => {
  const { getIcon } = useIcons();

  return (
    <Dropdown.Page id={drillInFieldMetadataItem.id}>
      <Dropdown.Back>{drillInFieldMetadataItem.label}</Dropdown.Back>
      <Dropdown.Separator />
      <ChartSettingsDropdownSection>
        <Dropdown.SelectionGroup
          value={checkedItemId ?? null}
          aria-label={drillInFieldMetadataItem.label}
        >
          <Dropdown.OptionItem
            value={drillInFieldMetadataItem.id}
            onSelect={() => onSelectField(drillInFieldMetadataItem)}
            startIcon={
              <SelectOptionIcon Icon={getIcon(drillInFieldMetadataItem.icon)} />
            }
          >
            {drillInFieldMetadataItem.label}
          </Dropdown.OptionItem>
          <Dropdown.Separator />
          {nestedFieldCandidates.map((nestedFieldMetadataItem) => (
            <Dropdown.OptionItem
              key={nestedFieldMetadataItem.id}
              value={nestedFieldMetadataItem.id}
              onSelect={() =>
                onSelectNestedField({
                  parentFieldMetadataItem: drillInFieldMetadataItem,
                  nestedFieldMetadataItem,
                })
              }
              startIcon={
                <SelectOptionIcon
                  Icon={getIcon(nestedFieldMetadataItem.icon)}
                />
              }
            >
              {nestedFieldMetadataItem.label}
            </Dropdown.OptionItem>
          ))}
        </Dropdown.SelectionGroup>
      </ChartSettingsDropdownSection>
    </Dropdown.Page>
  );
};
