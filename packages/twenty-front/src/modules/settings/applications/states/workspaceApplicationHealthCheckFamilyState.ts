import { type ApplicationHealthCheckState } from '@/settings/applications/types/ApplicationHealthCheckState';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const workspaceApplicationHealthCheckFamilyState = createAtomFamilyState<
  ApplicationHealthCheckState,
  string
>({
  key: 'workspaceApplicationHealthCheckFamilyState',
  defaultValue: { runId: null, result: null },
});
