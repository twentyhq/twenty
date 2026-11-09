import { getDashboardFilterBindingsUpdateOnObjectChange } from '@/page-layout/utils/getDashboardFilterBindingsUpdateOnObjectChange';
import {
  TEST_BAR_CHART_CONFIGURATION,
  TEST_FIELD_METADATA_ID_1,
  TEST_IFRAME_CONFIGURATION,
} from '~/testing/mock-data/widget-configurations';

const PERIOD_FILTER_ID = '6f2b8f1e-6a3c-4f4e-9d61-2f1c8a7b5e01';
const CLOSE_DATE_FILTER_ID = '6f2b8f1e-6a3c-4f4e-9d61-2f1c8a7b5e02';

const OVERRIDE = {
  pageLayoutFilterId: PERIOD_FILTER_ID,
  fieldMetadataId: TEST_FIELD_METADATA_ID_1,
};
const EXCLUSION = {
  pageLayoutFilterId: CLOSE_DATE_FILTER_ID,
  fieldMetadataId: null,
};

describe('getDashboardFilterBindingsUpdateOnObjectChange', () => {
  it('should drop the field overrides and keep the exclusions', () => {
    expect(
      getDashboardFilterBindingsUpdateOnObjectChange({
        ...TEST_BAR_CHART_CONFIGURATION,
        dashboardFilterBindings: [OVERRIDE, EXCLUSION],
      }),
    ).toEqual({ dashboardFilterBindings: [EXCLUSION] });
  });

  it.each([
    ['only exclusions', [EXCLUSION]],
    ['no bindings', null],
  ])('should leave the bindings untouched when there are %s', (_, bindings) => {
    expect(
      getDashboardFilterBindingsUpdateOnObjectChange({
        ...TEST_BAR_CHART_CONFIGURATION,
        dashboardFilterBindings: bindings,
      }),
    ).toEqual({});
  });

  it('should leave a configuration without bindings untouched', () => {
    expect(
      getDashboardFilterBindingsUpdateOnObjectChange(TEST_IFRAME_CONFIGURATION),
    ).toEqual({});
  });
});
