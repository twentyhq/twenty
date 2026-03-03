import { DialogComponentInstanceContext } from '@/ui/feedback/dialog-manager/contexts/DialogComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { type DialogOptions } from '@/ui/feedback/dialog-manager/types/DialogOptions';

type DialogState = {
  maxQueue: number;
  queue: DialogOptions[];
};

export const dialogInternalComponentState =
  createAtomComponentState<DialogState>({
    key: 'dialogInternalComponentState',
    defaultValue: {
      maxQueue: 2,
      queue: [],
    },
    componentInstanceContext: DialogComponentInstanceContext,
  });
