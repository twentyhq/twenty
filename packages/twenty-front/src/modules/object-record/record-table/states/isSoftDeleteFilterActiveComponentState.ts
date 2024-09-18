import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const isSoftDeleteFilterActiveComponentState =
  createComponentState<boolean>({
    key: 'isSoftDeleteFilterActiveComponentState',
    defaultValue: false,
  });
