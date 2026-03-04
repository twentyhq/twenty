import { type IconComponent } from 'twenty-ui/display';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const sidePanelPageInfoState = createAtomState<{
  title?: string;
  Icon?: IconComponent;
  instanceId: string;
}>({
  key: 'command-menu/sidePanelPageInfoState',
  defaultValue: {
    title: undefined,
    Icon: undefined,
    instanceId: '',
  },
});
