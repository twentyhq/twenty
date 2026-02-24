import { createState } from '@/ui/utilities/state/jotai/utils/createState';
export const updatedObjectNamePluralState = createState<string>({
  key: 'updatedObjectNamePluralState',
  defaultValue: '',
});
