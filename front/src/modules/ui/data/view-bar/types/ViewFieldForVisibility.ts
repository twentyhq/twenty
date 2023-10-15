import { FieldDefinition } from '@/ui/data/field/types/FieldDefinition';
import { FieldMetadata } from '@/ui/data/field/types/FieldMetadata';
import { ThemeColor } from '@/ui/theme/constants/colors';

export type ViewFieldForVisibility = Pick<
  FieldDefinition<FieldMetadata>,
  'key' | 'name' | 'Icon' | 'infoTooltipContent'
> & {
  isVisible?: boolean;
  colorCode?: ThemeColor;
  index: number;
  size?: number | undefined;
};
