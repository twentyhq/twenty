import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getRecordFieldColumnHeader } from '@/object-record/record-column-lookup/utils/getRecordFieldColumnHeader';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
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

  const startIcon = (
    <SelectOptionIcon Icon={getIcon(relationFieldMetadataItem.icon)} />
  );

  return (
    <>
      <Dropdown.Back
        aria-label={t`${relationFieldMetadataItem.label}, back to fields`}
      >
        {relationFieldMetadataItem.label}
      </Dropdown.Back>
      <Dropdown.Separator />
      <Dropdown.Section scrollable={false}>
        {isDefined(onPlainColumnSelect) && (
          <Dropdown.ActionItem
            onClick={onPlainColumnSelect}
            startIcon={startIcon}
          >
            {relationFieldMetadataItem.label}
          </Dropdown.ActionItem>
        )}
        <Dropdown.ActionItem
          onClick={onScopedColumnSelect}
          startIcon={startIcon}
        >
          {
            getRecordFieldColumnHeader({
              fieldMetadataItem: relationFieldMetadataItem,
              isScopedRelationColumn: true,
            }).label
          }
        </Dropdown.ActionItem>
      </Dropdown.Section>
    </>
  );
};
