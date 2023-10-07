import { FieldDefinition } from '@/ui/field/types/FieldDefinition';
import { FieldMetadata } from '@/ui/field/types/FieldMetadata';
import { ThemeColor } from '@/ui/theme/constants/colors';

export type ViewFieldForVisibility = Pick<
  FieldDefinition<FieldMetadata>,
  'key' | 'name' | 'Icon' | 'infoTooltipContent'
> & {
  isVisible?: boolean;
  colorCode?: ThemeColor;
  index: number;
};
