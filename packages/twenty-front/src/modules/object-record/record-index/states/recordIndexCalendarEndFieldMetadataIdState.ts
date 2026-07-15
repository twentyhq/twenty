import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const recordIndexCalendarEndFieldMetadataIdState = createAtomState<
  string | null
>({
  key: 'recordIndexCalendarEndFieldMetadataIdState',
  defaultValue: null,
});
