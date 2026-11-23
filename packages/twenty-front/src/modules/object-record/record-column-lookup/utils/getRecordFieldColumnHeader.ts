import { t } from '@lingui/core/macro';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordFieldLookupTarget } from '@/object-record/record-column-lookup/types/RecordFieldLookupTarget';
import { type RecordFieldSummary } from '@/object-record/record-column-summary/types/RecordFieldSummary';
import { getRecordFieldSummaryLabel } from '@/object-record/record-column-summary/utils/getRecordFieldSummaryLabel';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

type ColumnHeaderFieldMetadataItem = Pick<
  FieldMetadataItem,
  'label' | 'icon' | 'description'
>;

const getDefaultRecordFieldColumnHeader = ({
  fieldMetadataItem,
  lookupTarget,
  isScopedRelationColumn,
  summary,
}: {
  fieldMetadataItem: ColumnHeaderFieldMetadataItem;
  lookupTarget?: Pick<RecordFieldLookupTarget, 'lookupTargetFieldMetadataItem'>;
  isScopedRelationColumn?: boolean;
  summary?: Pick<
    RecordFieldSummary,
    'aggregateOperation' | 'aggregatedFieldMetadataItem'
  >;
}): ColumnHeaderFieldMetadataItem => {
  if (isDefined(summary)) {
    return {
      ...fieldMetadataItem,
      label: `${fieldMetadataItem.label} · ${getRecordFieldSummaryLabel(summary)}`,
    };
  }

  const label = isScopedRelationColumn
    ? `${fieldMetadataItem.label} · ${t`Filtered`}`
    : fieldMetadataItem.label;

  const lookupTargetFieldMetadataItem =
    lookupTarget?.lookupTargetFieldMetadataItem;

  if (!isDefined(lookupTargetFieldMetadataItem)) {
    return { ...fieldMetadataItem, label };
  }

  return {
    label: `${label} › ${lookupTargetFieldMetadataItem.label}`,
    icon: lookupTargetFieldMetadataItem.icon ?? fieldMetadataItem.icon,
    description:
      lookupTargetFieldMetadataItem.description ??
      fieldMetadataItem.description,
  };
};

export const getRecordFieldColumnHeader = ({
  customLabel,
  ...defaultColumnHeaderArgs
}: Parameters<typeof getDefaultRecordFieldColumnHeader>[0] & {
  customLabel?: string | null;
}): ColumnHeaderFieldMetadataItem => {
  const defaultColumnHeader = getDefaultRecordFieldColumnHeader(
    defaultColumnHeaderArgs,
  );

  return isNonEmptyString(customLabel)
    ? { ...defaultColumnHeader, label: customLabel }
    : defaultColumnHeader;
};
