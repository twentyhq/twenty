import { type ApplicationHealthCheckState } from '@/settings/applications/types/ApplicationHealthCheckState';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const connectionCheckFamilyState = createAtomFamilyState<
  ApplicationHealthCheckState,
  string
>({
  key: 'connectionCheckFamilyState',
  defaultValue: { runId: null, result: null },
});
