import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';
import { type SearchRecord } from '~/generated/graphql';

export const searchRecordStoreFamilyState = createAtomFamilyState<
  (SearchRecord & { record?: ObjectRecord }) | undefined,
  string
>({
  key: 'searchRecordStoreFamilyState',
  defaultValue: undefined,
});
