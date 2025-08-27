import { type IconComponent } from 'twenty-ui/display';
import { createState } from 'twenty-ui/utilities';

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
