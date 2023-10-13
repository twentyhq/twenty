import { FieldDefinition } from '@/ui/Data/Field/types/FieldDefinition';
import { FieldMetadata } from '@/ui/Data/Field/types/FieldMetadata';

export type ViewFieldForVisibility = Pick<
  FieldDefinition<FieldMetadata>,
  'key' | 'name' | 'Icon' | 'infoTooltipContent'
> & {
  isVisible?: boolean;
  index: number;
  size?: number | undefined;
};
