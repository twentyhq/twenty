import { type IconComponent } from 'twenty-ui/display';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const commandMenuPageInfoState = createAtomState<{
  title?: string;
  Icon?: IconComponent;
  instanceId: string;
}>({
  key: 'command-menu/commandMenuPageInfoState',
  defaultValue: {
    title: undefined,
    Icon: undefined,
    instanceId: '',
  },
});
