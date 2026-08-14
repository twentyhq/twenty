import { UI_SCALE_MULTIPLIERS } from '@/ui/theme/constants/UiScaleMultipliers';
import { type UiScale } from '@/workspace-member/types/WorkspaceMember';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const persistedUiScaleStepState = createAtomState<UiScale>({
  key: 'persistedUiScaleStepState',
  defaultValue: 'Default',
  useLocalStorage: true,
  validateInitFn: (step) => step in UI_SCALE_MULTIPLIERS,
});
