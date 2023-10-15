import { ColumnDefinition } from '@/ui/data/data-table/types/ColumnDefinition';
import { FieldMetadata } from '@/ui/data/field/types/FieldMetadata';
import { ThemeColor } from '@/ui/theme/constants/colors';

export type BoardColumnDefinition = ColumnDefinition<FieldMetadata> & {
  id: string;
  key: string;
  title: string;
  colorCode?: ThemeColor;
};
