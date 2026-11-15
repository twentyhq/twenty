import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { formatLookupColumnLabel } from '@/object-record/record-column-lookup/utils/formatLookupColumnLabel';
import { isHiddenSystemField } from '@/object-metadata/utils/isHiddenSystemField';
import { Select } from '@/ui/input/components/Select';
import { useLingui } from '@lingui/react/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { useIcons } from 'twenty-ui/icon/provider';

type SidePanelEditColumnLookupSelectProps = {
  fieldMetadataItem: FieldMetadataItem;
  relationObjectMetadataItem: EnrichedObjectMetadataItem;
  relationTargetFieldMetadataId: string | null;
  onChange: (relationTargetFieldMetadataId: string | null) => void;
};

export const SidePanelEditColumnLookupSelect = ({
  fieldMetadataItem,
  relationObjectMetadataItem,
  relationTargetFieldMetadataId,
  onChange,
}: SidePanelEditColumnLookupSelectProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();

  // Lookups follow one hop only, matching the server rule
  const lookupTargetOptions = relationObjectMetadataItem.readableFields
    .filter(
      (field) =>
        field.isActive &&
        !isHiddenSystemField(field) &&
        field.type !== FieldMetadataType.RELATION &&
        field.type !== FieldMetadataType.MORPH_RELATION,
    )
    .toSorted((a, b) => a.label.localeCompare(b.label))
    .map((field) => ({
      value: field.id,
      label: formatLookupColumnLabel({
        fieldMetadataItem,
        lookupTargetFieldMetadataItem: field,
      }),
      Icon: getIcon(field.icon),
    }));

  return (
    <Select
      dropdownId={`edit-column-lookup-${fieldMetadataItem.id}`}
      label={t`Show`}
      fullWidth
      withSearchInput
      value={relationTargetFieldMetadataId ?? ''}
      options={[
        {
          value: '',
          label: fieldMetadataItem.label,
          Icon: getIcon(fieldMetadataItem.icon),
        },
        ...lookupTargetOptions,
      ]}
      onChange={(value) => onChange(value === '' ? null : value)}
    />
  );
};
