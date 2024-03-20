import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const objectFilterDropdownSelectedEntityIdComponentState =
  createComponentState<string | null>({
    key: 'objectFilterDropdownSelectedEntityIdComponentState',
    defaultValue: null,
  });
