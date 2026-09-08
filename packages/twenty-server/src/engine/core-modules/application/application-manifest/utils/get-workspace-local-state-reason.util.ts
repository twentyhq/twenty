import { isDefined, isEmptyObject } from 'twenty-shared/utils';

export type WorkspaceLocalStateProperties = {
  isActive: boolean;
  overrides: object | null;
};

export const getWorkspaceLocalStateReason = ({
  isActive = true,
  overrides = null,
}: Partial<WorkspaceLocalStateProperties>): string | undefined => {
  const reasons = [
    ...(isActive ? [] : ['deactivated in this workspace, exported active']),
    ...(isDefined(overrides) && !isEmptyObject(overrides)
      ? ['workspace overrides not exported']
      : []),
  ];

  return reasons.length > 0 ? reasons.join(', ') : undefined;
};
