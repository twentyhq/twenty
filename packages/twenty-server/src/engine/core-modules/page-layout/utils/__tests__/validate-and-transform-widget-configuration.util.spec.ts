import {
  INVALID_BAR_CHART_CONFIG_MISSING_GROUP_BY,
  INVALID_IFRAME_CONFIG_BAD_URL,
  INVALID_IFRAME_CONFIG_EMPTY_URL,
  INVALID_IFRAME_CONFIG_MISSING_URL,
  INVALID_NUMBER_CHART_CONFIG_BAD_UUID,
  INVALID_NUMBER_CHART_CONFIG_MISSING_FIELDS,
  TEST_BAR_CHART_CONFIG,
  TEST_BAR_CHART_CONFIG_MINIMAL,
  TEST_GAUGE_CHART_CONFIG,
  TEST_GAUGE_CHART_CONFIG_MINIMAL,
  TEST_IFRAME_CONFIG,
  TEST_LINE_CHART_CONFIG,
  TEST_LINE_CHART_CONFIG_MINIMAL,
  TEST_NUMBER_CHART_CONFIG,
  TEST_NUMBER_CHART_CONFIG_MINIMAL,
  TEST_PIE_CHART_CONFIG,
  TEST_PIE_CHART_CONFIG_MINIMAL,
} from 'test/integration/constants/widget-configuration-test-data.constants';

import { WidgetConfigurationType } from 'src/engine/core-modules/page-layout/enums/widget-configuration-type.enum';
import { WidgetType } from 'src/engine/core-modules/page-layout/enums/widget-type.enum';
import { validateAndTransformWidgetConfiguration } from 'src/engine/core-modules/page-layout/utils/validate-and-transform-widget-configuration.util';

describe('validateAndTransformWidgetConfiguration', () => {
  describe('IFRAME widget', () => {
    it('should validate and transform valid iframe configuration', () => {
      const result = validateAndTransformWidgetConfiguration(
        WidgetType.IFRAME,
        TEST_IFRAME_CONFIG,
      );

      expect(result).toMatchObject(TEST_IFRAME_CONFIG);
      expect((result as any)?.configurationType).toBe(
        WidgetConfigurationType.IFRAME_CONFIG,
      );
    });

    it('should throw error for invalid URL', () => {
      expect(() =>
        validateAndTransformWidgetConfiguration(
          WidgetType.IFRAME,
          INVALID_IFRAME_CONFIG_BAD_URL,
        ),
      ).toThrow(/url must be a URL address/);
    });

    it('should throw error for missing URL', () => {
      expect(() =>
        validateAndTransformWidgetConfiguration(
          WidgetType.IFRAME,
          INVALID_IFRAME_CONFIG_MISSING_URL,
        ),
      ).toThrow(/url must be a URL address/);
    });

    it('should throw error for empty URL', () => {
      expect(() =>
        validateAndTransformWidgetConfiguration(
          WidgetType.IFRAME,
          INVALID_IFRAME_CONFIG_EMPTY_URL,
        ),
      ).toThrow(/url must be a URL address/);
    });
  });

  describe('GRAPH widget', () => {
    describe('NUMBER graph', () => {
      it('should validate full number graph configuration', () => {
        const result = validateAndTransformWidgetConfiguration(
          WidgetType.GRAPH,
          TEST_NUMBER_CHART_CONFIG,
        );

        expect(result).toMatchObject(TEST_NUMBER_CHART_CONFIG);
        expect((result as any)?.configurationType).toBe(
          WidgetConfigurationType.NUMBER_CHART_CONFIG,
        );
      });

      it('should validate minimal number graph configuration', () => {
        const result = validateAndTransformWidgetConfiguration(
          WidgetType.GRAPH,
          TEST_NUMBER_CHART_CONFIG_MINIMAL,
        );

        expect(result).toMatchObject(TEST_NUMBER_CHART_CONFIG_MINIMAL);
        expect((result as any)?.configurationType).toBe(
          WidgetConfigurationType.NUMBER_CHART_CONFIG,
        );
      });

      it('should throw error for missing required fields', () => {
        expect(() =>
          validateAndTransformWidgetConfiguration(
            WidgetType.GRAPH,
            INVALID_NUMBER_CHART_CONFIG_MISSING_FIELDS,
          ),
        ).toThrow(/aggregateFieldMetadataId should not be empty/);
      });

      it('should throw error for invalid UUID', () => {
        expect(() =>
          validateAndTransformWidgetConfiguration(
            WidgetType.GRAPH,
            INVALID_NUMBER_CHART_CONFIG_BAD_UUID,
          ),
        ).toThrow(/aggregateFieldMetadataId must be a UUID/);
      });
    });

    describe('BAR graph', () => {
      it('should validate full bar graph configuration', () => {
        const result = validateAndTransformWidgetConfiguration(
          WidgetType.GRAPH,
          TEST_BAR_CHART_CONFIG,
        );

        expect(result).toMatchObject(TEST_BAR_CHART_CONFIG);
        expect((result as any)?.configurationType).toBe(
          WidgetConfigurationType.BAR_CHART_CONFIG,
        );
      });

      it('should validate minimal bar graph configuration', () => {
        const result = validateAndTransformWidgetConfiguration(
          WidgetType.GRAPH,
          TEST_BAR_CHART_CONFIG_MINIMAL,
        );

        expect(result).toMatchObject(TEST_BAR_CHART_CONFIG_MINIMAL);
        expect((result as any)?.configurationType).toBe(
          WidgetConfigurationType.BAR_CHART_CONFIG,
        );
      });

      it('should throw error for missing group by field', () => {
        expect(() =>
          validateAndTransformWidgetConfiguration(
            WidgetType.GRAPH,
            INVALID_BAR_CHART_CONFIG_MISSING_GROUP_BY,
          ),
        ).toThrow(/groupByFieldMetadataIdX should not be empty/);
      });
    });

    describe('LINE graph', () => {
      it('should validate full line graph configuration', () => {
        const result = validateAndTransformWidgetConfiguration(
          WidgetType.GRAPH,
          TEST_LINE_CHART_CONFIG,
        );

        expect(result).toMatchObject(TEST_LINE_CHART_CONFIG);
        expect((result as any)?.configurationType).toBe(
          WidgetConfigurationType.LINE_CHART_CONFIG,
        );
      });

      it('should validate minimal line graph configuration', () => {
        const result = validateAndTransformWidgetConfiguration(
          WidgetType.GRAPH,
          TEST_LINE_CHART_CONFIG_MINIMAL,
        );

        expect(result).toMatchObject(TEST_LINE_CHART_CONFIG_MINIMAL);
        expect((result as any)?.configurationType).toBe(
          WidgetConfigurationType.LINE_CHART_CONFIG,
        );
      });
    });

    describe('PIE graph', () => {
      it('should validate full pie graph configuration', () => {
        const result = validateAndTransformWidgetConfiguration(
          WidgetType.GRAPH,
          TEST_PIE_CHART_CONFIG,
        );

        expect(result).toMatchObject(TEST_PIE_CHART_CONFIG);
        expect((result as any)?.configurationType).toBe(
          WidgetConfigurationType.PIE_CHART_CONFIG,
        );
      });

      it('should validate minimal pie graph configuration', () => {
        const result = validateAndTransformWidgetConfiguration(
          WidgetType.GRAPH,
          TEST_PIE_CHART_CONFIG_MINIMAL,
        );

        expect(result).toMatchObject(TEST_PIE_CHART_CONFIG_MINIMAL);
        expect((result as any)?.configurationType).toBe(
          WidgetConfigurationType.PIE_CHART_CONFIG,
        );
      });
    });

    describe('GAUGE graph', () => {
      it('should validate full gauge graph configuration', () => {
        const result = validateAndTransformWidgetConfiguration(
          WidgetType.GRAPH,
          TEST_GAUGE_CHART_CONFIG,
        );

        expect(result).toMatchObject(TEST_GAUGE_CHART_CONFIG);
        expect((result as any)?.configurationType).toBe(
          WidgetConfigurationType.GAUGE_CHART_CONFIG,
        );
      });

      it('should validate minimal gauge graph configuration', () => {
        const result = validateAndTransformWidgetConfiguration(
          WidgetType.GRAPH,
          TEST_GAUGE_CHART_CONFIG_MINIMAL,
        );

        expect(result).toMatchObject(TEST_GAUGE_CHART_CONFIG_MINIMAL);
        expect((result as any)?.configurationType).toBe(
          WidgetConfigurationType.GAUGE_CHART_CONFIG,
        );
      });
    });

    it('should return null for unsupported graph type', () => {
      const configuration = {
        graphType: 'UNSUPPORTED',
        viewId: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = validateAndTransformWidgetConfiguration(
        WidgetType.GRAPH,
        configuration,
      );

      expect(result).toBeNull();
    });

    it('should return null for missing graph type', () => {
      const configuration = {
        viewId: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = validateAndTransformWidgetConfiguration(
        WidgetType.GRAPH,
        configuration,
      );

      expect(result).toBeNull();
    });
  });

  describe('Edge cases', () => {
    it('should throw error for null configuration', () => {
      expect(() =>
        validateAndTransformWidgetConfiguration(WidgetType.IFRAME, null),
      ).toThrow('Invalid configuration: not an object');
    });

    it('should throw error for undefined configuration', () => {
      expect(() =>
        validateAndTransformWidgetConfiguration(WidgetType.IFRAME, undefined),
      ).toThrow('Invalid configuration: not an object');
    });

    it('should throw error for non-object configuration', () => {
      expect(() =>
        validateAndTransformWidgetConfiguration(WidgetType.IFRAME, 'string'),
      ).toThrow('Invalid configuration: not an object');
    });

    it('should return null for unsupported widget type', () => {
      const configuration = { someField: 'value' };

      const result = validateAndTransformWidgetConfiguration(
        'UNSUPPORTED' as WidgetType,
        configuration,
      );

      expect(result).toBeNull();
    });
  });

  describe('Error messages', () => {
    it('should include validation details in error message', () => {
      expect(() =>
        validateAndTransformWidgetConfiguration(
          WidgetType.GRAPH,
          INVALID_NUMBER_CHART_CONFIG_BAD_UUID,
        ),
      ).toThrow(/aggregateFieldMetadataId must be a UUID/);
    });
  });
});
