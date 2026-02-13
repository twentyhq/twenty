import { type IconComponent } from 'twenty-ui/display';
import { createState } from '@/ui/utilities/state/utils/createState';

export const commandMenuPageInfoState = createState<{
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
