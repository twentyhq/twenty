import { type FieldInputAnchorPosition } from '@/object-record/record-field/ui/types/FieldInputAnchorPosition';
import { createRequiredContext } from '~/utils/createRequiredContext';

export const [
  FieldInputAnchorContextProvider,
  useFieldInputAnchorContextOrThrow,
] = createRequiredContext<FieldInputAnchorPosition>('FieldInputAnchorContext');
