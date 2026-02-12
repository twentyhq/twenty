import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

// Jotai V2 equivalent of `recordIndexOpenRecordInState`.
// During migration, both Recoil and Jotai versions coexist.
// Writers update both; migrated readers use this V2 version.
export const recordIndexOpenRecordInStateV2 = createStateV2<ViewOpenRecordInType>({
  key: 'recordIndexOpenRecordInStateV2',
  defaultValue: ViewOpenRecordInType.SIDE_PANEL,
});
