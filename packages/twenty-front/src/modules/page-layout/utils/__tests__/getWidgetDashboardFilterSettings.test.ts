import {
  CLOSE_DATE_FIELD,
  OBJECT_FIELDS,
  PERIOD_FILTER,
  SIGNED_AT_FIELD,
} from '@/page-layout/testing/dashboardFilterWidgetFixtures';
import { getWidgetDashboardFilterSettings } from '@/page-layout/utils/getWidgetDashboardFilterSettings';
import { WidgetConfigurationType } from '~/generated-metadata/graphql';
import { TEST_AGGREGATE_CHART_CONFIGURATION } from '~/testing/mock-data/widget-configurations';

const SIGNUP_FILTER = {
  ...PERIOD_FILTER,
  id: 'signup-filter',
  label: 'Signup',
};

const RECORD_TABLE_CONFIGURATION = {
  __typename: 'RecordTableConfiguration' as const,
  configurationType: WidgetConfigurationType.RECORD_TABLE,
  viewId: 'view-1',
};

describe('getWidgetDashboardFilterSettings', () => {
  it('should flag the field a dashboard filter shares with the widget filter', () => {
    const { settings, overlappingFieldLabels } =
      getWidgetDashboardFilterSettings({
        pageLayoutFilters: [
          { ...PERIOD_FILTER, label: 'Period' },
          SIGNUP_FILTER,
        ],
        configuration: RECORD_TABLE_CONFIGURATION,
        fields: OBJECT_FIELDS,
        viewFilterFieldMetadataIds: [CLOSE_DATE_FIELD.id],
      });

    expect(
      settings.map(({ pageLayoutFilter }) => pageLayoutFilter.label),
    ).toEqual(['Period', 'Signup']);
    expect(overlappingFieldLabels).toEqual([CLOSE_DATE_FIELD.label]);
  });

  it('should flag an override to a filtered field', () => {
    expect(
      getWidgetDashboardFilterSettings({
        pageLayoutFilters: [{ ...PERIOD_FILTER, label: 'Period' }],
        configuration: {
          ...RECORD_TABLE_CONFIGURATION,
          dashboardFilterBindings: [
            {
              pageLayoutFilterId: PERIOD_FILTER.id,
              fieldMetadataId: SIGNED_AT_FIELD.id,
            },
          ],
        },
        fields: OBJECT_FIELDS,
        viewFilterFieldMetadataIds: [CLOSE_DATE_FIELD.id, SIGNED_AT_FIELD.id],
      }).overlappingFieldLabels,
    ).toEqual([SIGNED_AT_FIELD.label]);
  });

  it('should not flag a widget that is not filtered by the dashboard', () => {
    expect(
      getWidgetDashboardFilterSettings({
        pageLayoutFilters: [{ ...PERIOD_FILTER, label: 'Period' }],
        configuration: {
          ...TEST_AGGREGATE_CHART_CONFIGURATION,
          dashboardFilterBindings: [
            { pageLayoutFilterId: PERIOD_FILTER.id, fieldMetadataId: null },
          ],
        },
        fields: OBJECT_FIELDS,
        viewFilterFieldMetadataIds: [],
      }).overlappingFieldLabels,
    ).toEqual([]);
  });
});
