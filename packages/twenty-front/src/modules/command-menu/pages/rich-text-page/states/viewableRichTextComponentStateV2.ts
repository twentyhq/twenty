import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const viewableRichTextComponentStateV2 = createState<{
  activityId: string;
  activityObjectNameSingular: string;
}>({
  key: 'viewableRichTextComponentStateV2',
  defaultValue: {
    activityId: '',
    activityObjectNameSingular: '',
  },
});
