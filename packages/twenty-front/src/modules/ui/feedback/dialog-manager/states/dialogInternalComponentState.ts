import { DialogComponentInstanceContext } from '@/ui/feedback/dialog-manager/contexts/DialogComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { DialogOptions } from '../types/DialogOptions';

type DialogState = {
  maxQueue: number;
  queue: DialogOptions[];
};

export const dialogInternalComponentState = createComponentStateV2<DialogState>(
  {
    key: 'dialogInternalComponentState',
    defaultValue: {
      maxQueue: 2,
      queue: [],
    },
    componentInstanceContext: DialogComponentInstanceContext,
  },
);
