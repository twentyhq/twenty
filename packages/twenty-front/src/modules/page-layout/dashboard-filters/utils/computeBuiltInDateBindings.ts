import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import {
  type BuiltInBindingObjectMetadataItem,
  computeBuiltInBindings,
} from '@/page-layout/dashboard-filters/utils/computeBuiltInBindings';
import {
  type DashboardFilterBinding,
  FieldMetadataType,
} from 'twenty-shared/types';

const BUILT_IN_DATE_FIELD_NAME = 'createdAt';

const pickBuiltInDateField = (fields: FieldMetadataItem[]) =>
  fields.find(
    (field) =>
      field.name === BUILT_IN_DATE_FIELD_NAME &&
      field.type === FieldMetadataType.DATE_TIME &&
      field.isActive,
  );

export const computeBuiltInDateBindings = ({
  widgets,
  objectMetadataItems,
}: {
  widgets: PageLayoutWidget[];
  objectMetadataItems: BuiltInBindingObjectMetadataItem[];
}): Record<string, DashboardFilterBinding | null> =>
  computeBuiltInBindings({
    widgets,
    objectMetadataItems,
    pickField: pickBuiltInDateField,
  });
