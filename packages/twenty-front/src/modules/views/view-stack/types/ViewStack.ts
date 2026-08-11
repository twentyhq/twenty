import { type View } from '@/views/types/View';

export type ViewStack = {
  rootView: View;
  childViews: View[];
};
