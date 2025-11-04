import {
  INVALID_HORIZONTAL_BAR_CHART_CONFIG_MISSING_GROUP_BY,
  INVALID_IFRAME_CONFIG_BAD_URL,
  INVALID_IFRAME_CONFIG_EMPTY_URL,
  INVALID_NUMBER_CHART_CONFIG_BAD_UUID,
  INVALID_NUMBER_CHART_CONFIG_MISSING_FIELDS,
  INVALID_VERTICAL_BAR_CHART_CONFIG_MISSING_GROUP_BY,
  TEST_GAUGE_CHART_CONFIG,
  TEST_HORIZONTAL_BAR_CHART_CONFIG,
  TEST_HORIZONTAL_BAR_CHART_CONFIG_MINIMAL,
  TEST_IFRAME_CONFIG,
  TEST_LINE_CHART_CONFIG,
  TEST_NUMBER_CHART_CONFIG,
  TEST_NUMBER_CHART_CONFIG_MINIMAL,
  TEST_PIE_CHART_CONFIG,
  TEST_VERTICAL_BAR_CHART_CONFIG,
  TEST_VERTICAL_BAR_CHART_CONFIG_MINIMAL,
} from 'test/integration/constants/widget-configuration-test-data.constants';

import { WidgetType } from 'src/engine/core-modules/page-layout/enums/widget-type.enum';
import { validateAndTransformWidgetConfiguration } from 'src/engine/core-modules/page-layout/utils/validate-and-transform-widget-configuration.util';

describe('validateAndTransformWidgetConfiguration', () => {
  describe('IFRAME widget', () => {
    it('should validate and transform valid iframe configuration', () => {
      const result = validateAndTransformWidgetConfiguration({
        type: WidgetType.IFRAME,
        configuration: TEST_IFRAME_CONFIG,
        isDashboardV2Enabled: false,
      });

      expect(result).toMatchObject(TEST_IFRAME_CONFIG);
    });

    it('should throw error for invalid URL', () => {
      expect(() =>
        validateAndTransformWidgetConfiguration({
          type: WidgetType.IFRAME,
          configuration: INVALID_IFRAME_CONFIG_BAD_URL,
          isDashboardV2Enabled: false,
        }),
      ).toThrow(/url must be a URL address/);
    });

    it('should throw error for empty URL', () => {
      expect(() =>
        validateAndTransformWidgetConfiguration({
          type: WidgetType.IFRAME,
          configuration: INVALID_IFRAME_CONFIG_EMPTY_URL,
          isDashboardV2Enabled: false,
        }),
      ).toThrow(/url must be a URL address/);
    });
  });

  describe('GRAPH widget', () => {
    describe('NUMBER graph', () => {
      it('should validate full number graph configuration', () => {
        const result = validateAndTransformWidgetConfiguration({
          type: WidgetType.GRAPH,
          configuration: TEST_NUMBER_CHART_CONFIG,
          isDashboardV2Enabled: false,
        });

        expect(result).toMatchObject(TEST_NUMBER_CHART_CONFIG);
      });

      it('should validate minimal number graph configuration', () => {
        const result = validateAndTransformWidgetConfiguration({
          type: WidgetType.GRAPH,
          configuration: TEST_NUMBER_CHART_CONFIG_MINIMAL,
          isDashboardV2Enabled: false,
        });

        expect(result).toMatchObject(TEST_NUMBER_CHART_CONFIG_MINIMAL);
      });

      it('should throw error for partial number graph configuration with missing required fields', () => {
        expect(() =>
          validateAndTransformWidgetConfiguration({
            type: WidgetType.GRAPH,
            configuration: INVALID_NUMBER_CHART_CONFIG_MISSING_FIELDS,
            isDashboardV2Enabled: false,
          }),
        ).toThrow(/aggregateFieldMetadataId.*aggregateOperation/);
      });

      it('should throw error for invalid UUID', () => {
        expect(() =>
          validateAndTransformWidgetConfiguration({
            type: WidgetType.GRAPH,
            configuration: INVALID_NUMBER_CHART_CONFIG_BAD_UUID,
            isDashboardV2Enabled: false,
          }),
        ).toThrow(/aggregateFieldMetadataId must be a UUID/);
      });
    });

    describe('VERTICAL_BAR graph', () => {
      it('should validate full vertical bar graph configuration', () => {
        const result = validateAndTransformWidgetConfiguration({
          type: WidgetType.GRAPH,
          configuration: TEST_VERTICAL_BAR_CHART_CONFIG,
          isDashboardV2Enabled: false,
        });

        expect(result).toMatchObject(TEST_VERTICAL_BAR_CHART_CONFIG);
      });

      it('should validate minimal vertical bar graph configuration', () => {
        const result = validateAndTransformWidgetConfiguration({
          type: WidgetType.GRAPH,
          configuration: TEST_VERTICAL_BAR_CHART_CONFIG_MINIMAL,
          isDashboardV2Enabled: false,
        });

        expect(result).toMatchObject(TEST_VERTICAL_BAR_CHART_CONFIG_MINIMAL);
      });

      it('should throw error for partial vertical bar graph configuration with missing required fields', () => {
        expect(() =>
          validateAndTransformWidgetConfiguration({
            type: WidgetType.GRAPH,
            configuration: INVALID_VERTICAL_BAR_CHART_CONFIG_MISSING_GROUP_BY,
            isDashboardV2Enabled: false,
          }),
        ).toThrow(/primaryAxisGroupByFieldMetadataId/);
      });
    });

    describe('HORIZONTAL_BAR graph', () => {
      it('should validate full horizontal bar graph configuration', () => {
        const result = validateAndTransformWidgetConfiguration({
          type: WidgetType.GRAPH,
          configuration: TEST_HORIZONTAL_BAR_CHART_CONFIG,
          isDashboardV2Enabled: false,
        });

        expect(result).toMatchObject(TEST_HORIZONTAL_BAR_CHART_CONFIG);
      });

      it('should validate minimal horizontal bar graph configuration', () => {
        const result = validateAndTransformWidgetConfiguration({
          type: WidgetType.GRAPH,
          configuration: TEST_HORIZONTAL_BAR_CHART_CONFIG_MINIMAL,
          isDashboardV2Enabled: false,
        });

        expect(result).toMatchObject(TEST_HORIZONTAL_BAR_CHART_CONFIG_MINIMAL);
      });

      it('should throw error for partial horizontal bar graph configuration with missing required fields', () => {
        expect(() =>
          validateAndTransformWidgetConfiguration({
            type: WidgetType.GRAPH,
            configuration: INVALID_HORIZONTAL_BAR_CHART_CONFIG_MISSING_GROUP_BY,
            isDashboardV2Enabled: false,
          }),
        ).toThrow(/primaryAxisGroupByFieldMetadataId/);
      });
    });

    it('should return null for unsupported graph type', () => {
      const configuration = {
        graphType: 'UNSUPPORTED',
        viewId: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = validateAndTransformWidgetConfiguration({
        type: WidgetType.GRAPH,
        configuration: configuration,
        isDashboardV2Enabled: false,
      });

      expect(result).toBeNull();
    });

    it('should return null for missing graph type', () => {
      const configuration = {
        viewId: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = validateAndTransformWidgetConfiguration({
        type: WidgetType.GRAPH,
        configuration: configuration,
        isDashboardV2Enabled: false,
      });

      expect(result).toBeNull();
    });
  });

  describe('Edge cases', () => {
    it('should throw error for null configuration', () => {
      expect(() =>
        validateAndTransformWidgetConfiguration({
          type: WidgetType.IFRAME,
          configuration: null,
          isDashboardV2Enabled: false,
        }),
      ).toThrow('Invalid configuration: not an object');
    });

    it('should throw error for undefined configuration', () => {
      expect(() =>
        validateAndTransformWidgetConfiguration({
          type: WidgetType.IFRAME,
          configuration: undefined,
          isDashboardV2Enabled: false,
        }),
      ).toThrow('Invalid configuration: not an object');
    });

    it('should throw error for non-object configuration', () => {
      expect(() =>
        validateAndTransformWidgetConfiguration({
          type: WidgetType.IFRAME,
          configuration: 'string',
          isDashboardV2Enabled: false,
        }),
      ).toThrow('Invalid configuration: not an object');
    });

    it('should return null for unsupported widget type', () => {
      const configuration = { someField: 'value' };

      const result = validateAndTransformWidgetConfiguration({
        type: 'UNSUPPORTED' as WidgetType,
        configuration: configuration,
        isDashboardV2Enabled: false,
      });

      expect(result).toBeNull();
    });
  });

  describe('Error messages', () => {
    it('should include validation details in error message', () => {
      expect(() =>
        validateAndTransformWidgetConfiguration({
          type: WidgetType.GRAPH,
          configuration: INVALID_NUMBER_CHART_CONFIG_BAD_UUID,
          isDashboardV2Enabled: false,
        }),
      ).toThrow(/aggregateFieldMetadataId must be a UUID/);
    });
  });

  describe('Feature flags', () => {
    it('should throw error for unsupported graph type', () => {
      expect(() =>
        validateAndTransformWidgetConfiguration({
          type: WidgetType.GRAPH,
          configuration: TEST_PIE_CHART_CONFIG,
          isDashboardV2Enabled: false,
        }),
      ).toThrow(/IS_DASHBOARD_V2_ENABLED feature flag/);

      expect(() =>
        validateAndTransformWidgetConfiguration({
          type: WidgetType.GRAPH,
          configuration: TEST_LINE_CHART_CONFIG,
          isDashboardV2Enabled: false,
        }),
      ).toThrow(/IS_DASHBOARD_V2_ENABLED feature flag/);

      expect(() =>
        validateAndTransformWidgetConfiguration({
          type: WidgetType.GRAPH,
          configuration: TEST_GAUGE_CHART_CONFIG,
          isDashboardV2Enabled: false,
        }),
      ).toThrow(/IS_DASHBOARD_V2_ENABLED feature flag/);
    });

    it('should not throw error when IS_DASHBOARD_V2_ENABLED feature flag is enabled', () => {
      expect(() =>
        validateAndTransformWidgetConfiguration({
          type: WidgetType.GRAPH,
          configuration: TEST_PIE_CHART_CONFIG,
          isDashboardV2Enabled: true,
        }),
      ).not.toThrow();
    });

    it('should not throw error when IS_DASHBOARD_V2_ENABLED feature flag is enabled', () => {
      expect(() =>
        validateAndTransformWidgetConfiguration({
          type: WidgetType.GRAPH,
          configuration: TEST_LINE_CHART_CONFIG,
          isDashboardV2Enabled: true,
        }),
      ).not.toThrow();
    });

    it('should not throw error when IS_DASHBOARD_V2_ENABLED feature flag is enabled', () => {
      expect(() =>
        validateAndTransformWidgetConfiguration({
          type: WidgetType.GRAPH,
          configuration: TEST_GAUGE_CHART_CONFIG,
          isDashboardV2Enabled: true,
        }),
      ).not.toThrow();
    });
  });
});
