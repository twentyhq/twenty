import { atom, RecoilState } from 'recoil';

export const viewableRichTextComponentState: RecoilState<{
  activityId: string;
  activityObjectNameSingular: string;
}> = atom({
  key: 'viewableRichTextComponentState',
  default: {
    activityId: '',
    activityObjectNameSingular: '',
  },
});
