import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const viewableRichTextComponentState = createAtomState<{
  activityId: string;
  activityObjectNameSingular: string;
}>({
  key: 'viewableRichTextComponentState',
  defaultValue: {
    activityId: '',
    activityObjectNameSingular: '',
  },
});
