import { DialogComponentInstanceContext } from '@/ui/feedback/dialog-manager/contexts/DialogComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { DialogOptions } from '../types/DialogOptions';

type DialogState = {
  maxQueue: number;
  queue: DialogOptions[];
};

export const dialogInternalComponentState = createComponentState<DialogState>({
  key: 'dialogInternalComponentState',
  defaultValue: {
    maxQueue: 2,
    queue: [],
  },
  componentInstanceContext: DialogComponentInstanceContext,
});
