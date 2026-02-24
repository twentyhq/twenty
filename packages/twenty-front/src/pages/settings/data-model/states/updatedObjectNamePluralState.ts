import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';
export const updatedObjectNamePluralState = createStateV2<string>({
  key: 'updatedObjectNamePluralState',
  defaultValue: '',
});
