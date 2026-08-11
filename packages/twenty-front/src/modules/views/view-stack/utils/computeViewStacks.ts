import { type View } from '@/views/types/View';
import { type ViewStack } from '@/views/view-stack/types/ViewStack';
import { isDefined } from 'twenty-shared/utils';

const byPosition = (viewA: View, viewB: View) =>
  viewA.position - viewB.position;

export const computeViewStacks = (views: View[]): ViewStack[] => {
  const viewIds = new Set(views.map((view) => view.id));

  // A view pointing at a parent that is gone (deleted, or hidden from this user)
  // is shown as a stack of its own instead of disappearing from the view bar.
  const isRootView = (view: View) =>
    !isDefined(view.parentViewId) || !viewIds.has(view.parentViewId);

  return views
    .filter(isRootView)
    .sort(byPosition)
    .map((rootView) => ({
      rootView,
      childViews: views
        .filter(
          (view) => !isRootView(view) && view.parentViewId === rootView.id,
        )
        .sort(byPosition),
    }));
};
