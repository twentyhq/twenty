import { type CoreObjectFilterField } from '@/object-core/filters/types/CoreObjectFilterField';

export const findCoreObjectFilterField = <TFieldKey extends string>({
  filterFields,
  fieldKey,
}: {
  filterFields: CoreObjectFilterField<TFieldKey>[];
  fieldKey: string | undefined;
}) => filterFields.find((field) => field.key === fieldKey);
