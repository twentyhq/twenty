import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const scopedRelationRecordsFamilyState = createAtomFamilyState<
  ObjectRecord[] | undefined,
  { viewFieldId: string; recordId: string }
>({
  key: 'scopedRelationRecordsFamilyState',
  defaultValue: undefined,
});
