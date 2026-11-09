import {
  DRAFT_VIEW_SNAPSHOT,
  SAVED_VIEW,
} from '@/page-layout/testing/recordTableWidgetViewFixtures';
import { getPageLayoutWidgetViewFilterFieldMetadataIds } from '@/page-layout/utils/getPageLayoutWidgetViewFilterFieldMetadataIds';
import { WidgetConfigurationType } from '~/generated-metadata/graphql';
import { TEST_BAR_CHART_CONFIGURATION } from '~/testing/mock-data/widget-configurations';

const RECORD_TABLE_WIDGET = {
  id: 'widget-1',
  configuration: {
    __typename: 'RecordTableConfiguration' as const,
    configurationType: WidgetConfigurationType.RECORD_TABLE,
    viewId: SAVED_VIEW.id,
  },
};

const viewsById = new Map([[SAVED_VIEW.id, SAVED_VIEW]]);

describe('getPageLayoutWidgetViewFilterFieldMetadataIds', () => {
  it('should list the fields filtered by the unsaved view first', () => {
    expect(
      getPageLayoutWidgetViewFilterFieldMetadataIds({
        widget: RECORD_TABLE_WIDGET,
        viewsById,
        recordTableWidgetViewDrafts: {
          [RECORD_TABLE_WIDGET.id]: DRAFT_VIEW_SNAPSHOT,
        },
      }),
    ).toEqual(['draft-field-id']);
  });

  it('should list the fields filtered by the saved view without an unsaved one', () => {
    expect(
      getPageLayoutWidgetViewFilterFieldMetadataIds({
        widget: RECORD_TABLE_WIDGET,
        viewsById,
        recordTableWidgetViewDrafts: {},
      }),
    ).toEqual(['saved-field-id']);
  });

  it('should list nothing for a widget without a view', () => {
    expect(
      getPageLayoutWidgetViewFilterFieldMetadataIds({
        widget: { id: 'chart', configuration: TEST_BAR_CHART_CONFIGURATION },
        viewsById,
        recordTableWidgetViewDrafts: {},
      }),
    ).toEqual([]);
  });
});
