import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';

export type ActivityTargetObjectRecord = {
  activityTargetId: string | null;
};

export const activityTargetObjectRecordFamilyState = createFamilyState<
  ActivityTargetObjectRecord,
  string
>({
  key: 'activityTargetObjectRecordFamilyState',
  defaultValue: { activityTargetId: null },
});
