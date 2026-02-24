import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { createFamilyStateV2 } from '@/ui/utilities/state/jotai/utils/createFamilyStateV2';
import { type SearchRecord } from '~/generated/graphql';

export const searchRecordStoreFamilyState = createFamilyStateV2<
  (SearchRecord & { record?: ObjectRecord }) | undefined,
  string
>({
  key: 'searchRecordStoreFamilyState',
  defaultValue: undefined,
});
