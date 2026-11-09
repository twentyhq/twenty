import { type DashboardFilterWidgetField } from '@/page-layout/types/DashboardFilterWidgetField';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import {
  TEST_FIELD_METADATA_ID_1,
  TEST_FIELD_METADATA_ID_2,
  TEST_FIELD_METADATA_ID_3,
} from '~/testing/mock-data/widget-configurations';

const buildField = (
  field: Omit<DashboardFilterWidgetField, 'icon' | 'isActive'> &
    Partial<DashboardFilterWidgetField>,
): DashboardFilterWidgetField => ({
  icon: 'IconCalendar',
  isActive: true,
  ...field,
});

export const AMOUNT_FIELD = buildField({
  id: TEST_FIELD_METADATA_ID_1,
  name: 'amount',
  label: 'Amount',
  type: FieldMetadataType.CURRENCY,
});

export const CLOSE_DATE_FIELD = buildField({
  id: TEST_FIELD_METADATA_ID_2,
  name: 'closeDate',
  label: 'Close date',
  type: FieldMetadataType.DATE,
});

export const SIGNED_AT_FIELD = buildField({
  id: TEST_FIELD_METADATA_ID_3,
  name: 'signedAt',
  label: 'Signed at',
  type: FieldMetadataType.DATE_TIME,
});

export const CREATED_AT_FIELD = buildField({
  id: 'created-at-field',
  name: 'createdAt',
  label: 'Creation date',
  type: FieldMetadataType.DATE_TIME,
});

export const DELETED_AT_FIELD = buildField({
  id: 'deleted-at-field',
  name: 'deletedAt',
  label: 'Deleted',
  type: FieldMetadataType.DATE_TIME,
});

export const INACTIVE_DATE_FIELD = buildField({
  id: 'inactive-date-field',
  name: 'renewalDate',
  label: 'Renewal date',
  type: FieldMetadataType.DATE,
  isActive: false,
});

export const OBJECT_FIELDS = [
  AMOUNT_FIELD,
  CLOSE_DATE_FIELD,
  SIGNED_AT_FIELD,
  CREATED_AT_FIELD,
  DELETED_AT_FIELD,
  INACTIVE_DATE_FIELD,
];
