import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const recordIndexCalendarFieldMetadataIdState = createAtomState<
  string | null
>({
  key: 'recordIndexCalendarFieldMetadataIdState',
  defaultValue: null,
});
