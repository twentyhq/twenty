import { FieldDefinition } from '@/ui/data/field/types/FieldDefinition';
import { FieldMetadata } from '@/ui/data/field/types/FieldMetadata';

export type ViewFieldForVisibility = Pick<
  FieldDefinition<FieldMetadata>,
  'key' | 'name' | 'Icon' | 'infoTooltipContent'
> & {
  isVisible?: boolean;
  index: number;
  size?: number | undefined;
};
