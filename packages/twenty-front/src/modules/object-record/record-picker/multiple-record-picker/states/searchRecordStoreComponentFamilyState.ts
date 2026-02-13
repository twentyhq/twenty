import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';
import { type SearchRecord } from '~/generated/graphql';

export const searchRecordStoreFamilyState = createFamilyState<
  (SearchRecord & { record?: ObjectRecord }) | undefined,
  string
>({
  key: 'searchRecordStoreFamilyState',
  defaultValue: undefined,
});
