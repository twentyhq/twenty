import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const isCurrentViewKeyIndexComponentState =
  createComponentState<boolean>({
    key: 'isCurrentViewKeyIndexComponentState',
    defaultValue: true,
  });
