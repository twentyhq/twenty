import { SnackBarComponentInstanceContext } from '@/ui/feedback/snack-bar-manager/contexts/SnackBarComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { type SnackBarProps } from '@/ui/feedback/snack-bar-manager/components/SnackBar';

export type SnackBarOptions = SnackBarProps & {
  id: string;
};

export type SnackBarState = {
  maxQueue: number;
  queue: SnackBarOptions[];
};

export const snackBarInternalComponentState =
  createComponentState<SnackBarState>({
    key: 'snackBarState',
    defaultValue: {
      maxQueue: 3,
      queue: [],
    },
    componentInstanceContext: SnackBarComponentInstanceContext,
  });
