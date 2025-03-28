import { createState } from 'twenty-ui/utilities';
import { IconComponent } from 'twenty-ui/display';

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
