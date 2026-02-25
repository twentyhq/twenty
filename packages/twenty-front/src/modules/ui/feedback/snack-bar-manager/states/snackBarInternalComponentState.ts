import { SnackBarComponentInstanceContext } from '@/ui/feedback/snack-bar-manager/contexts/SnackBarComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { type SnackBarProps } from '@/ui/feedback/snack-bar-manager/components/SnackBar';

export type SnackBarOptions = SnackBarProps & {
  id: string;
};

export type SnackBarState = {
  maxQueue: number;
  queue: SnackBarOptions[];
};

export const snackBarInternalComponentState =
  createAtomComponentState<SnackBarState>({
    key: 'snackBarState',
    defaultValue: {
      maxQueue: 3,
      queue: [],
    },
    componentInstanceContext: SnackBarComponentInstanceContext,
  });
