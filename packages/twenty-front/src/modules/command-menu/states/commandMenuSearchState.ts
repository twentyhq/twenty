import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';
export const commandMenuSearchState = createStateV2<string>({
  key: 'command-menu/commandMenuSearchState',
  defaultValue: '',
});
