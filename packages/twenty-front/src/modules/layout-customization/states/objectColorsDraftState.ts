import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type ThemeColor } from 'twenty-ui/theme';

export const objectColorsDraftState = createAtomState<
  Record<string, ThemeColor>
>({
  key: 'objectColorsDraftState',
  defaultValue: {},
});
