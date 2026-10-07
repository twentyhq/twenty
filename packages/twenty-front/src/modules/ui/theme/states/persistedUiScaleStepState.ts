import { UI_SCALE_MULTIPLIERS } from '@/ui/theme/constants/UiScaleMultipliers';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type UiScale } from '@/ui/theme/types/UiScale';

export const persistedUiScaleStepState = createAtomState<UiScale>({
  key: 'persistedUiScaleStepState',
  defaultValue: 'Default',
  useLocalStorage: true,
  validateInitFn: (step) => Object.hasOwn(UI_SCALE_MULTIPLIERS, step),
});
