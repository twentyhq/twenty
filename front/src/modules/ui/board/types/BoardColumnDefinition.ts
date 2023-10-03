import { FieldMetadata } from '@/ui/field/types/FieldMetadata';
import { ColumnDefinition } from '@/ui/table/types/ColumnDefinition';
import { ThemeColor } from '@/ui/theme/constants/colors';

export type BoardColumnDefinition = ColumnDefinition<FieldMetadata> & {
  id: string;
  key: string;
  title: string;
  colorCode?: ThemeColor;
};
