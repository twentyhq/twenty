import { SnackBarComponentInstanceContext } from '@/ui/feedback/snack-bar-manager/contexts/SnackBarComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { SnackBarProps } from '../components/SnackBar';

export type SnackBarOptions = SnackBarProps & {
  id: string;
};

export type SnackBarState = {
  maxQueue: number;
  queue: SnackBarOptions[];
};

export const snackBarInternalComponentState =
  createComponentStateV2<SnackBarState>({
    key: 'snackBarState',
    defaultValue: {
      maxQueue: 3,
      queue: [],
    },
    componentInstanceContext: SnackBarComponentInstanceContext,
  });
