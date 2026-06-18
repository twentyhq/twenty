import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type IconComponent } from 'twenty-ui/icon';

export const sidePanelPageInfoState = createAtomState<{
  title?: string;
  Icon?: IconComponent;
  instanceId: string;
}>({
  key: 'side-panel/sidePanelPageInfoState',
  defaultValue: {
    title: undefined,
    Icon: undefined,
    instanceId: '',
  },
});
