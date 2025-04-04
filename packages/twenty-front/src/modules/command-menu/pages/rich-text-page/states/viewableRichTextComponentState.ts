import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { atom, RecoilState } from 'recoil';

export const viewableRichTextComponentState: RecoilState<{
  activityId: string;
  activityObjectNameSingular:
    | CoreObjectNameSingular.Note
    | CoreObjectNameSingular.Task
    | null;
}> = atom({
  key: 'viewableRichTextComponentState',
  default: {
    activityId: '',
    activityObjectNameSingular: null,
  } as {
    activityId: string;
    activityObjectNameSingular:
      | CoreObjectNameSingular.Note
      | CoreObjectNameSingular.Task
      | null;
  },
});
