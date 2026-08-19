import { type MessageDescriptor } from '@lingui/core';
import { type ReactNode } from 'react';

import { type TableFieldMetadata } from '@/ui/layout/table/types/TableFieldMetadata';

// One definition per column drives the header, the grid track and the cell,
// so a core object only has to declare its columns once. A column without a
// fieldType is not sortable (useSortedArray only sorts string and number fields)
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
