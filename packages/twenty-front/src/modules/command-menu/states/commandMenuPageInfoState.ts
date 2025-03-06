import { createState } from '@ui/utilities/state/utils/createState';
import { IconComponent } from 'twenty-ui';

export const commandMenuPageInfoState = createState<{
  title?: string;
  Icon?: IconComponent;
  instanceId: string;
  titleInHistory?: string;
  IconInHistory?: IconComponent;
}>({
  key: 'command-menu/commandMenuPageInfoState',
  defaultValue: {
    title: undefined,
    Icon: undefined,
    titleInHistory: undefined,
    IconInHistory: undefined,
    instanceId: '',
  },
});
