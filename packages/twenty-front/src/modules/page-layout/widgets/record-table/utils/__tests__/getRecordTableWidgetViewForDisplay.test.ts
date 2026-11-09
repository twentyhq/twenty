import {
  DRAFT_VIEW_SNAPSHOT,
  SAVED_VIEW,
} from '@/page-layout/testing/recordTableWidgetViewFixtures';
import { getRecordTableWidgetViewForDisplay } from '@/page-layout/widgets/record-table/utils/getRecordTableWidgetViewForDisplay';

describe('getRecordTableWidgetViewForDisplay', () => {
  it('should prefer the unsaved view over the saved one', () => {
    expect(
      getRecordTableWidgetViewForDisplay({
        draftSnapshot: DRAFT_VIEW_SNAPSHOT,
        view: SAVED_VIEW,
      })?.viewFilters.map(({ id }) => id),
    ).toEqual(['draft-view-filter']);
  });

  it('should fall back to the saved view without an unsaved one', () => {
    expect(
      getRecordTableWidgetViewForDisplay({
        draftSnapshot: undefined,
        view: SAVED_VIEW,
      }),
    ).toBe(SAVED_VIEW);
  });
});
