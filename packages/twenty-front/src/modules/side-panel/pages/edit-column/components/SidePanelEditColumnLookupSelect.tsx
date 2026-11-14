import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { formatLookupColumnLabel } from '@/object-record/record-column-lookup/utils/formatLookupColumnLabel';
import { isLookupTargetCandidateField } from '@/object-record/record-column-lookup/utils/isLookupTargetCandidateField';
import { Select } from '@/ui/input/components/Select';
import { useLingui } from '@lingui/react/macro';
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

  const lookupTargetOptions = relationObjectMetadataItem.fields
    .filter(isLookupTargetCandidateField)
    .toSorted((a, b) => a.label.localeCompare(b.label))
    .map((field) => ({
      value: field.id,
      label: formatLookupColumnLabel(fieldMetadataItem, field),
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
