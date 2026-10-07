import { computePersistedDashboardFilterBindings } from '@/page-layout/dashboard-filters/utils/computePersistedDashboardFilterBindings';
import { type DashboardFilterBinding } from 'twenty-shared/types';
import { WidgetType } from '~/generated-metadata/graphql';
import {
  TEST_BAR_CHART_CONFIGURATION,
  TEST_FIELD_METADATA_ID_1,
  TEST_FIELD_METADATA_ID_2,
  TEST_FIELDS_CONFIGURATION,
  createTestWidget,
} from '~/testing/mock-data/widget-configurations';

const BINDINGS: Record<string, DashboardFilterBinding | null> = {
  date: { fieldMetadataId: TEST_FIELD_METADATA_ID_1 },
  owner: {
    fieldMetadataId: TEST_FIELD_METADATA_ID_2,
    relationTargetFieldMetadataId: TEST_FIELD_METADATA_ID_1,
  },
  unapplied: null,
};

describe('computePersistedDashboardFilterBindings', () => {
  it('should read the bindings saved on each chart widget configuration', () => {
    const boundWidget = createTestWidget({
      id: 'bound-widget',
      configuration: {
        ...TEST_BAR_CHART_CONFIGURATION,
        dashboardFilterBindings: BINDINGS,
      },
    });

    expect(
      computePersistedDashboardFilterBindings({ widgets: [boundWidget] }),
    ).toEqual({ 'bound-widget': BINDINGS });
  });

  it('should skip chart widgets without a bindings entry', () => {
    const widgetWithoutBindings = createTestWidget({
      id: 'no-bindings-widget',
      configuration: TEST_BAR_CHART_CONFIGURATION,
    });

    expect(
      computePersistedDashboardFilterBindings({
        widgets: [widgetWithoutBindings],
      }),
    ).toEqual({});
  });

  it('should skip non-chart widgets', () => {
    const fieldsWidget = createTestWidget({
      id: 'fields-widget',
      type: WidgetType.FIELDS,
      configuration: TEST_FIELDS_CONFIGURATION,
    });

    expect(
      computePersistedDashboardFilterBindings({ widgets: [fieldsWidget] }),
    ).toEqual({});
  });
});
