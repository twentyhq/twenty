import { type ApplicationHealthCheckState } from '@/settings/applications/types/ApplicationHealthCheckState';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const myApplicationHealthCheckFamilyState = createAtomFamilyState<
  ApplicationHealthCheckState,
  string
>({
  key: 'myApplicationHealthCheckFamilyState',
  defaultValue: { runId: null, result: null },
});
