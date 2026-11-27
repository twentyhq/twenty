import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const frontComponentWorkspaceApplicationsState = createAtomState<{
  workspaceId: string;
  sessionGeneration: string | null;
  eventCount: number;
  bootstrapApplications: CurrentWorkspace['installedApplications'];
  ids: Promise<Set<string> | null>;
} | null>({
  key: 'frontComponentWorkspaceApplicationsState',
  defaultValue: null,
});
