import { type IconComponent } from 'twenty-ui/display';
import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const commandMenuPageInfoState = createStateV2<{
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
