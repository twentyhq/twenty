import { getRelatedRecordsWidgetSources } from '@/page-layout/widgets/field/utils/getRelatedRecordsWidgetSources';
import { isRelatedRecordsWidgetSourceAvailableForLayout } from '@/page-layout/widgets/field/utils/isRelatedRecordsWidgetSourceAvailableForLayout';
import { RECORD_TABLE_WIDGET_LAYOUT_VIEW_TYPES } from '@/page-layout/widgets/record-table/types/RecordTableWidgetLayoutViewType';
import { ViewType } from '~/generated-metadata/graphql';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const [opportunitiesSource] = getRelatedRecordsWidgetSources({
  fieldMetadataItems: getMockObjectMetadataItemOrThrow('company').fields.filter(
    (field) => field.name === 'opportunities',
  ),
  objectMetadataItems: getTestEnrichedObjectMetadataItemsMock(),
});

describe('isRelatedRecordsWidgetSourceAvailableForLayout', () => {
  it('should offer kanban for a relation whose records have a select field', () => {
    expect(
      isRelatedRecordsWidgetSourceAvailableForLayout({
        relatedRecordsWidgetSource: opportunitiesSource,
        layoutViewType: ViewType.KANBAN_WIDGET,
      }),
    ).toBe(true);
  });

  it('should not offer kanban or calendar without a field to lay records out by', () => {
    const sourceWithoutLayoutFields = {
      ...opportunitiesSource,
      defaultGroupByFieldMetadataItem: null,
      defaultCalendarFieldMetadataItem: null,
    };

    expect(
      RECORD_TABLE_WIDGET_LAYOUT_VIEW_TYPES.filter((layoutViewType) =>
        isRelatedRecordsWidgetSourceAvailableForLayout({
          relatedRecordsWidgetSource: sourceWithoutLayoutFields,
          layoutViewType,
        }),
      ),
    ).toEqual([ViewType.TABLE_WIDGET, ViewType.LIST_WIDGET]);
  });
});
