import { ViewKey } from '@/views/types/ViewKey';
import { computeViewPickerVisibleViews } from '@/views/view-picker/utils/computeViewPickerVisibleViews';

const INDEX_VIEW = { id: 'index-view-id', key: ViewKey.INDEX };
const INITIAL_VIEW = { id: 'initial-view-id', key: null };
const USER_VIEW = { id: 'user-view-id', key: null };

describe('computeViewPickerVisibleViews', () => {
  it('hides the index view', () => {
    const result = computeViewPickerVisibleViews({
      views: [INDEX_VIEW, INITIAL_VIEW, USER_VIEW],
    });

    expect(result).toEqual([INITIAL_VIEW, USER_VIEW]);
  });

  it('keeps the index view visible while it is the one being displayed', () => {
    const result = computeViewPickerVisibleViews({
      views: [INDEX_VIEW, INITIAL_VIEW],
      currentViewId: INDEX_VIEW.id,
    });

    expect(result).toEqual([INDEX_VIEW, INITIAL_VIEW]);
  });

  it('keeps the index view when hiding it would leave no view at all', () => {
    const result = computeViewPickerVisibleViews({
      views: [INDEX_VIEW],
    });

    expect(result).toEqual([INDEX_VIEW]);
  });
});
