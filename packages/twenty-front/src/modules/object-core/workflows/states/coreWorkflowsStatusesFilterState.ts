import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { CoreWorkflowStatus } from '~/generated/graphql';

export const coreWorkflowsStatusesFilterState = createAtomState<
  CoreWorkflowStatus[]
>({
  key: 'coreWorkflowsStatusesFilterState',
  defaultValue: [],
  useLocalStorage: true,
  localStorageOptions: { getOnInit: true },
  validateInitFn: (statuses) =>
    Array.isArray(statuses) &&
    statuses.every((status) =>
      Object.values(CoreWorkflowStatus).includes(status),
    ),
});
