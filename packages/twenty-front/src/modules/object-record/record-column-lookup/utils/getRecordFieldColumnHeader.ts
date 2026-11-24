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

// What the header needs of a RecordFieldColumnKind, so the column editor can name a column it has not saved yet
type ColumnHeaderColumnKind =
  | { kind: 'field' | 'scopedRecords' }
  | {
      kind: 'lookup' | 'scopedLookup';
      lookupTarget: Pick<
        RecordFieldLookupTarget,
        'lookupTargetFieldMetadataItem'
      >;
    }
  | {
      kind: 'summary';
      summary?: Pick<
        RecordFieldSummary,
        'aggregateOperation' | 'aggregatedFieldMetadataItem'
      >;
    };

const getFilteredLabel = (fieldMetadataItem: ColumnHeaderFieldMetadataItem) =>
  `${fieldMetadataItem.label} · ${t`Filtered`}`;

const getDefaultRecordFieldColumnHeader = ({
  fieldMetadataItem,
  columnKind,
}: {
  fieldMetadataItem: ColumnHeaderFieldMetadataItem;
  columnKind: ColumnHeaderColumnKind;
}): ColumnHeaderFieldMetadataItem => {
  switch (columnKind.kind) {
    case 'field':
      return { ...fieldMetadataItem };
    case 'scopedRecords':
      return {
        ...fieldMetadataItem,
        label: getFilteredLabel(fieldMetadataItem),
      };
    case 'summary':
      return {
        ...fieldMetadataItem,
        label: isDefined(columnKind.summary)
          ? `${fieldMetadataItem.label} · ${getRecordFieldSummaryLabel(columnKind.summary)}`
          : getFilteredLabel(fieldMetadataItem),
      };
    case 'lookup':
    case 'scopedLookup': {
      const { lookupTargetFieldMetadataItem } = columnKind.lookupTarget;
      const label =
        columnKind.kind === 'scopedLookup'
          ? getFilteredLabel(fieldMetadataItem)
          : fieldMetadataItem.label;

      return {
        label: `${label} › ${lookupTargetFieldMetadataItem.label}`,
        icon: lookupTargetFieldMetadataItem.icon ?? fieldMetadataItem.icon,
        description:
          lookupTargetFieldMetadataItem.description ??
          fieldMetadataItem.description,
      };
    }
  }
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
