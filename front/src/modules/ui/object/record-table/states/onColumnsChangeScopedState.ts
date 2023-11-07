import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

import { FieldMetadata } from '../../field/types/FieldMetadata';
import { ColumnDefinition } from '../types/ColumnDefinition';

export const onColumnsChangeScopedState = createScopedState<
  ((columns: ColumnDefinition<FieldMetadata>[]) => void) | undefined
>({
  key: 'onColumnsChangeScopedState',
  defaultValue: undefined,
});
