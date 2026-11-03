import { type CoreAgentCommandId } from '@/object-core/commands/types/CoreAgentCommandId';
import { type IconComponent } from 'twenty-ui/icon';

export type CoreAgentCommand = {
  id: CoreAgentCommandId;
  label: string;
  Icon: IconComponent;
  section: 'THIS_OBJECT' | 'SELECTION';
  disabled: boolean;
};
