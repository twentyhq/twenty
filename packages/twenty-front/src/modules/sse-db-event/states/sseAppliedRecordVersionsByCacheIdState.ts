import { type SseAppliedRecordVersion } from '@/sse-db-event/types/SseAppliedRecordVersion';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const sseAppliedRecordVersionsByCacheIdState = createAtomState<
  Record<string, SseAppliedRecordVersion>
>({
  key: 'sseAppliedRecordVersionsByCacheIdState',
  defaultValue: {},
});
