import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const viewableRichTextComponentStateV2 = createStateV2<{
  activityId: string;
  activityObjectNameSingular: string;
}>({
  key: 'viewableRichTextComponentStateV2',
  defaultValue: {
    activityId: '',
    activityObjectNameSingular: '',
  },
});
