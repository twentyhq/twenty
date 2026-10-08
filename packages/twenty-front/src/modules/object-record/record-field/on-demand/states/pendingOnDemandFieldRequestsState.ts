import { type OnDemandFieldLoadResult } from '@/object-record/record-field/on-demand/types/OnDemandFieldLoadResult';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const pendingOnDemandFieldRequestsState = createAtomState<
  Partial<
    Record<
      string,
      { requestOwner: object; promise: Promise<OnDemandFieldLoadResult> }
    >
  >
>({
  key: 'pendingOnDemandFieldRequestsState',
  defaultValue: {},
});
