import { computeViewPickerVisibleViews } from '@/views/view-picker/utils/computeViewPickerVisibleViews';
import { ViewKey } from '@/views/types/ViewKey';

const INDEX_VIEW = { id: 'index-view-id', key: ViewKey.INDEX };
const DEFAULT_VIEW = { id: 'default-view-id', key: ViewKey.DEFAULT };
const USER_VIEW = { id: 'user-view-id', key: null };

describe('computeViewPickerVisibleViews', () => {
  it('keeps the index view while the object has no default view', () => {
    const result = computeViewPickerVisibleViews({
      views: [INDEX_VIEW, USER_VIEW],
    });

    expect(result).toEqual([INDEX_VIEW, USER_VIEW]);
  });

  it('hides the index view once the object has a default view', () => {
    const result = computeViewPickerVisibleViews({
      views: [INDEX_VIEW, DEFAULT_VIEW, USER_VIEW],
    });

    expect(result).toEqual([DEFAULT_VIEW, USER_VIEW]);
  });

  it('keeps the index view visible while it is the one being displayed', () => {
    const result = computeViewPickerVisibleViews({
      views: [INDEX_VIEW, DEFAULT_VIEW],
      currentViewId: INDEX_VIEW.id,
    });

    expect(result).toEqual([INDEX_VIEW, DEFAULT_VIEW]);
  });

  it('leaves an object with only an index view untouched', () => {
    const result = computeViewPickerVisibleViews({ views: [INDEX_VIEW] });

    expect(result).toEqual([INDEX_VIEW]);
  });
});
