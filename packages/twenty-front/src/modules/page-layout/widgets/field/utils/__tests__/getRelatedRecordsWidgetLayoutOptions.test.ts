import { getRelatedRecordsWidgetLayoutOptions } from '@/page-layout/widgets/field/utils/getRelatedRecordsWidgetLayoutOptions';
import { getRelatedRecordsWidgetSources } from '@/page-layout/widgets/field/utils/getRelatedRecordsWidgetSources';
import { ViewType } from '~/generated-metadata/graphql';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const [opportunitiesSource] = getRelatedRecordsWidgetSources({
  fieldMetadataItems: getMockObjectMetadataItemOrThrow('company').fields.filter(
    (field) => field.name === 'opportunities',
  ),
  objectMetadataItems: getTestEnrichedObjectMetadataItemsMock(),
});

const getDisabledViewTypes = (
  sources: Parameters<typeof getRelatedRecordsWidgetLayoutOptions>[0],
) =>
  getRelatedRecordsWidgetLayoutOptions(sources)
    .filter(({ isDisabled }) => isDisabled)
    .map(({ viewType }) => viewType);

describe('getRelatedRecordsWidgetLayoutOptions', () => {
  it('should offer no layout without a relation to list', () => {
    expect(getRelatedRecordsWidgetLayoutOptions([])).toEqual([]);
  });

  it('should enable every layout a relation supports', () => {
    expect(getDisabledViewTypes([opportunitiesSource])).toEqual([]);
  });

  it('should disable kanban and calendar when no relation has a field for them', () => {
    expect(
      getDisabledViewTypes([
        {
          defaultGroupByFieldMetadataItem: null,
          defaultCalendarFieldMetadataItem: null,
        },
      ]),
    ).toEqual([ViewType.KANBAN_WIDGET, ViewType.CALENDAR_WIDGET]);
  });

  it('should enable a layout as soon as one relation supports it', () => {
    expect(
      getDisabledViewTypes([
        {
          defaultGroupByFieldMetadataItem: null,
          defaultCalendarFieldMetadataItem: null,
        },
        opportunitiesSource,
      ]),
    ).toEqual([]);
  });
});
