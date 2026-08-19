import { type MessageDescriptor } from '@lingui/core';
import { type ReactNode } from 'react';

import { type TableFieldMetadata } from '@/ui/layout/table/types/TableFieldMetadata';

// A column without a fieldType is not sortable: useSortedArray only handles
// string and number fields
export type CoreObjectTableColumn<TItem> = Pick<
  TableFieldMetadata<TItem>,
  'align' | 'FieldIcon'
> & {
  fieldName: keyof TItem & string;
  fieldLabel: MessageDescriptor;
  fieldType?: TableFieldMetadata<TItem>['fieldType'];
  gridTrack: string;
  renderCell: (item: TItem) => ReactNode;
};
