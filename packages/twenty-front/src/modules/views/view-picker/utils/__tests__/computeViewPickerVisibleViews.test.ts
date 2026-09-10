import { ViewKey } from '@/views/types/ViewKey';
import { computeViewPickerVisibleViews } from '@/views/view-picker/utils/computeViewPickerVisibleViews';

const INDEX_VIEW = { id: 'index-view-id', key: ViewKey.INDEX };
const SEEDED_VIEW = { id: 'seeded-view-id', key: null };
const USER_VIEW = { id: 'user-view-id', key: null };

describe('computeViewPickerVisibleViews', () => {
  it('keeps every view while the flag is off', () => {
    const result = computeViewPickerVisibleViews({
      views: [INDEX_VIEW, USER_VIEW],
      isSeededDefaultViewEnabled: false,
    });

    expect(result).toEqual([INDEX_VIEW, USER_VIEW]);
  });

  it('hides the index view once the flag is on', () => {
    const result = computeViewPickerVisibleViews({
      views: [INDEX_VIEW, SEEDED_VIEW, USER_VIEW],
      isSeededDefaultViewEnabled: true,
    });

    expect(result).toEqual([SEEDED_VIEW, USER_VIEW]);
  });

  it('keeps the index view visible while it is the one being displayed', () => {
    const result = computeViewPickerVisibleViews({
      views: [INDEX_VIEW, SEEDED_VIEW],
      currentViewId: INDEX_VIEW.id,
      isSeededDefaultViewEnabled: true,
    });

    expect(result).toEqual([INDEX_VIEW, SEEDED_VIEW]);
  });

  it('keeps the index view when hiding it would leave no view at all', () => {
    const result = computeViewPickerVisibleViews({
      views: [INDEX_VIEW],
      isSeededDefaultViewEnabled: true,
    });

    expect(result).toEqual([INDEX_VIEW]);
  });
});
