import { PermissionFlagType } from 'twenty-shared/constants';

import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';

export const useCanTestCoreAgents = () =>
  useHasPermissionFlag(PermissionFlagType.AI);
