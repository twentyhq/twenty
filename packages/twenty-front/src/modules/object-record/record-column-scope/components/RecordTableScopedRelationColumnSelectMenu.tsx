import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconPlus } from 'twenty-ui/icon';
import { useIcons } from 'twenty-ui/icon/provider';

type RecordTableScopedRelationColumnSelectMenuProps = {
  relationFieldMetadataItem: FieldMetadataItem;
  // Absent once the plain column of the relation is shown
  onPlainColumnSelect?: () => void;
  onScopedColumnSelect: () => void;
};

export const RecordTableScopedRelationColumnSelectMenu = ({
  relationFieldMetadataItem,
  onPlainColumnSelect,
  onScopedColumnSelect,
}: RecordTableScopedRelationColumnSelectMenuProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();

  return (
    <>
      <Dropdown.Back
        aria-label={t`${relationFieldMetadataItem.label}, back to fields`}
      >
        {relationFieldMetadataItem.label}
      </Dropdown.Back>
      {isDefined(onPlainColumnSelect) && (
        <>
          <Dropdown.Section scrollable={false}>
            <Dropdown.ActionItem
              onClick={onPlainColumnSelect}
              startIcon={
                <SelectOptionIcon
                  Icon={getIcon(relationFieldMetadataItem.icon)}
                />
              }
            >
              {relationFieldMetadataItem.label}
            </Dropdown.ActionItem>
          </Dropdown.Section>
          <Dropdown.Separator />
        </>
      )}
      <Dropdown.Section scrollable={false}>
        <Dropdown.ActionItem
          onClick={onScopedColumnSelect}
          startIcon={<IconPlus />}
          description={t`Count, total, list`}
          descriptionPlacement="inline"
        >
          {t`Add summary column`}
        </Dropdown.ActionItem>
      </Dropdown.Section>
    </>
  );
};
