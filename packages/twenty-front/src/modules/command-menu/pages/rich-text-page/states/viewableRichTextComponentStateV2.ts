import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const viewableRichTextComponentStateV2 = createAtomState<{
  activityId: string;
  activityObjectNameSingular: string;
}>({
  key: 'viewableRichTextComponentStateV2',
  defaultValue: {
    activityId: '',
    activityObjectNameSingular: '',
  },
});
