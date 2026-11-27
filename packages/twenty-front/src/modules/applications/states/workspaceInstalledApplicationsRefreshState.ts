import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const workspaceInstalledApplicationsRefreshState = createAtomState<{
  workspaceId: string;
  sessionGeneration: string | null;
  version: number;
  isCurrentUserLoaded: boolean;
  completed: Promise<boolean>;
} | null>({
  key: 'workspaceInstalledApplicationsRefreshState',
  defaultValue: null,
});

export const workspaceInstalledApplicationsVersionState =
  createAtomState<number>({
    key: 'workspaceInstalledApplicationsVersionState',
    defaultValue: 0,
  });
