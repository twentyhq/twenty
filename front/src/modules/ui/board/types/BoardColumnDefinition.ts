import { ColumnDefinition } from '@/ui/data-table/types/ColumnDefinition';
import { FieldMetadata } from '@/ui/field/types/FieldMetadata';
import { ThemeColor } from '@/ui/theme/constants/colors';

export type BoardColumnDefinition = ColumnDefinition<FieldMetadata> & {
  id: string;
  key: string;
  title: string;
  colorCode?: ThemeColor;
};
