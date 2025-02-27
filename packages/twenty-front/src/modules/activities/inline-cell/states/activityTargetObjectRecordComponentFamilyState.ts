import { ActivityTargetInlineCellComponentInstanceContext } from '@/activities/inline-cell/states/contexts/ActivityTargetInlineCellComponentInstanceContext';
import { createComponentFamilyStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentFamilyStateV2';

export type ActivityTargetObjectRecord = {
  activityTargetId: string | null;
};

export const activityTargetObjectRecordComponentFamilyState =
  createComponentFamilyStateV2<ActivityTargetObjectRecord, string>({
    key: 'activityTargetObjectRecordComponentFamilyState',
    defaultValue: { activityTargetId: null },
    componentInstanceContext: ActivityTargetInlineCellComponentInstanceContext,
  });
