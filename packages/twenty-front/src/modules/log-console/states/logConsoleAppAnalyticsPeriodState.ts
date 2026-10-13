import { type PeriodPreset } from '@/settings/usage/utils/periodPreset';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const logConsoleAppAnalyticsPeriodState = createAtomState<PeriodPreset>({
  key: 'logConsoleAppAnalyticsPeriodState',
  defaultValue: '30d',
});
