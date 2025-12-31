import { renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { type ChartConfiguration } from '@/command-menu/pages/page-layout/types/ChartConfiguration';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingIds';
import { type TypedBarChartConfiguration } from '@/command-menu/pages/page-layout/types/TypedBarChartConfiguration';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import {
  AggregateOperations,
  AxisNameDisplay,
  BarChartGroupMode,
  BarChartLayout,
  FieldMetadataType,
  GraphOrderBy,
  WidgetConfigurationType,
} from '~/generated-metadata/graphql';
import { useChartSettingsValues } from '@/command-menu/pages/page-layout/hooks/useChartSettingsValues';

const mockObjectMetadataItem: ObjectMetadataItem = {
  id: 'obj-1',
  nameSingular: 'company',
  namePlural: 'companies',
  labelSingular: 'Company',
  labelPlural: 'Companies',
  fields: [
    {
      id: 'field-company-name',
      name: 'name',
      label: 'Company Name',
      type: FieldMetadataType.TEXT,
    },
    {
      id: 'field-amount',
      name: 'amount',
      label: 'Amount',
      type: FieldMetadataType.NUMBER,
    },
    {
      id: 'field-stage',
      name: 'stage',
      label: 'Stage',
      type: FieldMetadataType.TEXT,
    },
    {
      id: 'field-full-name',
      name: 'fullName',
      label: 'Full Name',
      type: FieldMetadataType.FULL_NAME,
      subFields: [
        {
          id: 'field-full-name-first',
          name: 'firstName',
          label: 'First Name',
          type: FieldMetadataType.TEXT,
        },
      ],
    },
  ],
} as ObjectMetadataItem;

const buildBarChartConfiguration = (
  overrides: Partial<TypedBarChartConfiguration>,
): TypedBarChartConfiguration =>
  ({
    __typename: 'BarChartConfiguration',
    aggregateFieldMetadataId: 'field-amount',
    aggregateOperation: AggregateOperations.SUM,
    primaryAxisGroupByFieldMetadataId: 'field-company-name',
    primaryAxisGroupBySubFieldName: null,
    secondaryAxisGroupByFieldMetadataId: null,
    secondaryAxisGroupBySubFieldName: null,
    primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
    secondaryAxisOrderBy: null,
    axisNameDisplay: AxisNameDisplay.BOTH,
    displayDataLabel: false,
    groupMode: 'GROUPED',
    ...overrides,
  }) as TypedBarChartConfiguration;

const renderUseChartSettingsValues = (configuration: ChartConfiguration) => {
  return renderHook(
    () =>
      useChartSettingsValues({
        objectMetadataId: mockObjectMetadataItem.id,
        configuration,
      }),
    {
      wrapper: ({ children }) => (
        <RecoilRoot
          initializeState={({ set }) => {
            set(objectMetadataItemsState, [mockObjectMetadataItem]);
          }}
        >
          {children}
        </RecoilRoot>
      ),
    },
  );
};

describe('useChartSettingsValues', () => {
  describe('Vertical bar chart (1D - single grouping)', () => {
    const verticalBarConfig = buildBarChartConfiguration({
      primaryAxisGroupByFieldMetadataId: 'field-company-name',
      secondaryAxisGroupByFieldMetadataId: null,
    });

    it('should return primary field label for DATA_ON_DISPLAY_X', () => {
      const { result } = renderUseChartSettingsValues(verticalBarConfig);

      const value = result.current.getChartSettingsValues(
        CHART_CONFIGURATION_SETTING_IDS.DATA_ON_DISPLAY_X,
      );

      expect(value).toBe('Company Name');
    });

    it('should return aggregate field with operation for DATA_ON_DISPLAY_Y', () => {
      const { result } = renderUseChartSettingsValues(verticalBarConfig);

      const value = result.current.getChartSettingsValues(
        CHART_CONFIGURATION_SETTING_IDS.DATA_ON_DISPLAY_Y,
      );

      expect(value).toBe('Amount (Sum)');
    });

    it('should return object label plural for SOURCE', () => {
      const { result } = renderUseChartSettingsValues(verticalBarConfig);

      const value = result.current.getChartSettingsValues(
        CHART_CONFIGURATION_SETTING_IDS.SOURCE,
      );

      expect(value).toBe('Companies');
    });

    it('should return sort label for SORT_BY_X', () => {
      const { result } = renderUseChartSettingsValues(verticalBarConfig);

      const value = result.current.getChartSettingsValues(
        CHART_CONFIGURATION_SETTING_IDS.PRIMARY_SORT_BY,
      );

      expect(value).toBeDefined();
      expect(typeof value).toBe('string');
    });

    it('should return displayDataLabel value for DATA_LABELS', () => {
      const { result } = renderUseChartSettingsValues(verticalBarConfig);

      const value = result.current.getChartSettingsValues(
        CHART_CONFIGURATION_SETTING_IDS.DATA_LABELS,
      );

      expect(value).toBe(false);
    });

    it('should return axis name display option for AXIS_NAME', () => {
      const { result } = renderUseChartSettingsValues(verticalBarConfig);

      const value = result.current.getChartSettingsValues(
        CHART_CONFIGURATION_SETTING_IDS.AXIS_NAME,
      );

      expect(value).toBeDefined();
      expect(typeof value).toBe('string');
    });
  });

  describe('Horizontal bar chart (1D - single grouping)', () => {
    const horizontalBarConfig = buildBarChartConfiguration({
      layout: BarChartLayout.HORIZONTAL,
      primaryAxisGroupByFieldMetadataId: 'field-company-name',
      secondaryAxisGroupByFieldMetadataId: null,
    });

    it('should return SAME primary field label for DATA_ON_DISPLAY_X (no swapping)', () => {
      const { result } = renderUseChartSettingsValues(horizontalBarConfig);

      const value = result.current.getChartSettingsValues(
        CHART_CONFIGURATION_SETTING_IDS.DATA_ON_DISPLAY_X,
      );

      // Critical test: horizontal should return the SAME value as vertical
      expect(value).toBe('Company Name');
    });

    it('should return SAME aggregate field for DATA_ON_DISPLAY_Y (no swapping)', () => {
      const { result } = renderUseChartSettingsValues(horizontalBarConfig);

      const value = result.current.getChartSettingsValues(
        CHART_CONFIGURATION_SETTING_IDS.DATA_ON_DISPLAY_Y,
      );

      // Critical test: horizontal should return the SAME value as vertical
      expect(value).toBe('Amount (Sum)');
    });

    it('should return SAME sort label for SORT_BY_X (no swapping)', () => {
      const { result } = renderUseChartSettingsValues(horizontalBarConfig);

      const value = result.current.getChartSettingsValues(
        CHART_CONFIGURATION_SETTING_IDS.PRIMARY_SORT_BY,
      );

      expect(value).toBeDefined();
      expect(typeof value).toBe('string');
    });
  });

  describe('Vertical bar chart (2D - with secondary grouping)', () => {
    const verticalBar2DConfig = buildBarChartConfiguration({
      layout: BarChartLayout.VERTICAL,
      primaryAxisGroupByFieldMetadataId: 'field-company-name',
      secondaryAxisGroupByFieldMetadataId: 'field-stage',
      secondaryAxisOrderBy: GraphOrderBy.FIELD_DESC,
    });

    it('should return primary field label for DATA_ON_DISPLAY_X', () => {
      const { result } = renderUseChartSettingsValues(verticalBar2DConfig);

      const value = result.current.getChartSettingsValues(
        CHART_CONFIGURATION_SETTING_IDS.DATA_ON_DISPLAY_X,
      );

      expect(value).toBe('Company Name');
    });

    it('should return secondary field label for GROUP_BY', () => {
      const { result } = renderUseChartSettingsValues(verticalBar2DConfig);

      const value = result.current.getChartSettingsValues(
        CHART_CONFIGURATION_SETTING_IDS.GROUP_BY,
      );

      expect(value).toBe('Stage');
    });

    it('should return secondary sort label for SORT_BY_GROUP_BY_FIELD', () => {
      const { result } = renderUseChartSettingsValues(verticalBar2DConfig);

      const value = result.current.getChartSettingsValues(
        CHART_CONFIGURATION_SETTING_IDS.SORT_BY_GROUP_BY_FIELD,
      );

      expect(value).toBeDefined();
      expect(typeof value).toBe('string');
    });
  });

  describe('Horizontal bar chart (2D - with secondary grouping)', () => {
    const horizontalBar2DConfig = buildBarChartConfiguration({
      layout: BarChartLayout.HORIZONTAL,
      primaryAxisGroupByFieldMetadataId: 'field-company-name',
      secondaryAxisGroupByFieldMetadataId: 'field-stage',
      secondaryAxisOrderBy: GraphOrderBy.FIELD_DESC,
    });

    it('should return SAME primary field for DATA_ON_DISPLAY_X (no swapping)', () => {
      const { result } = renderUseChartSettingsValues(horizontalBar2DConfig);

      const value = result.current.getChartSettingsValues(
        CHART_CONFIGURATION_SETTING_IDS.DATA_ON_DISPLAY_X,
      );

      expect(value).toBe('Company Name');
    });

    it('should return SAME secondary field for GROUP_BY (no swapping)', () => {
      const { result } = renderUseChartSettingsValues(horizontalBar2DConfig);

      const value = result.current.getChartSettingsValues(
        CHART_CONFIGURATION_SETTING_IDS.GROUP_BY,
      );

      expect(value).toBe('Stage');
    });
  });

  describe('Composite field with subfield', () => {
    const configWithSubField = buildBarChartConfiguration({
      layout: BarChartLayout.VERTICAL,
      primaryAxisGroupByFieldMetadataId: 'field-full-name',
      primaryAxisGroupBySubFieldName: 'firstName',
    });

    it('should return field label with subfield label for DATA_ON_DISPLAY_X', () => {
      const { result } = renderUseChartSettingsValues(configWithSubField);

      const value = result.current.getChartSettingsValues(
        CHART_CONFIGURATION_SETTING_IDS.DATA_ON_DISPLAY_X,
      );

      expect(value).toContain('Full Name');
      expect(typeof value).toBe('string');
    });
  });

  describe('Stacked bars setting', () => {
    it('should return false when groupMode is GROUPED', () => {
      const config = buildBarChartConfiguration({
        groupMode: BarChartGroupMode.GROUPED,
      });

      const { result } = renderUseChartSettingsValues(config);

      const value = result.current.getChartSettingsValues(
        CHART_CONFIGURATION_SETTING_IDS.STACKED_BARS,
      );

      expect(value).toBe(false);
    });

    it('should return true when groupMode is STACKED', () => {
      const config = buildBarChartConfiguration({
        groupMode: BarChartGroupMode.STACKED,
      });

      const { result } = renderUseChartSettingsValues(config);

      const value = result.current.getChartSettingsValues(
        CHART_CONFIGURATION_SETTING_IDS.STACKED_BARS,
      );

      expect(value).toBe(true);
    });
  });

  describe('Colors setting', () => {
    it('should return undefined when no color is set', () => {
      const config = buildBarChartConfiguration({});

      const { result } = renderUseChartSettingsValues(config);

      const value = result.current.getChartSettingsValues(
        CHART_CONFIGURATION_SETTING_IDS.COLORS,
      );

      expect(value).toBeUndefined();
    });

    it('should return capitalized color when color is set', () => {
      const config = buildBarChartConfiguration({
        color: 'blue',
      });

      const { result } = renderUseChartSettingsValues(config);

      const value = result.current.getChartSettingsValues(
        CHART_CONFIGURATION_SETTING_IDS.COLORS,
      );

      expect(value).toBe('Blue');
    });
  });

  describe('No configuration', () => {
    it('should return undefined function when configuration is undefined', () => {
      const { result } = renderUseChartSettingsValues(undefined as any);

      const value = result.current.getChartSettingsValues(
        CHART_CONFIGURATION_SETTING_IDS.SOURCE,
      );

      expect(value).toBeUndefined();
    });
  });

  describe('Edge cases - Missing fields', () => {
    it('should handle missing primaryAxisGroupByFieldMetadataId gracefully', () => {
      const config = buildBarChartConfiguration({
        primaryAxisGroupByFieldMetadataId: 'non-existent-field-id',
      });

      const { result } = renderUseChartSettingsValues(config);

      const value = result.current.getChartSettingsValues(
        CHART_CONFIGURATION_SETTING_IDS.DATA_ON_DISPLAY_X,
      );

      expect(value).toBeUndefined();
    });

    it('should handle missing aggregateFieldMetadataId gracefully', () => {
      const config = buildBarChartConfiguration({
        aggregateFieldMetadataId: 'non-existent-aggregate-field',
      });

      const { result } = renderUseChartSettingsValues(config);

      const value = result.current.getChartSettingsValues(
        CHART_CONFIGURATION_SETTING_IDS.DATA_ON_DISPLAY_Y,
      );

      expect(value).toBe('');
    });

    it('should handle missing secondaryAxisGroupByFieldMetadataId gracefully', () => {
      const config = buildBarChartConfiguration({
        secondaryAxisGroupByFieldMetadataId: 'non-existent-secondary-field',
      });

      const { result } = renderUseChartSettingsValues(config);

      const value = result.current.getChartSettingsValues(
        CHART_CONFIGURATION_SETTING_IDS.GROUP_BY,
      );

      expect(value).toBeUndefined();
    });

    it('should handle missing objectMetadataItem gracefully', () => {
      const config = buildBarChartConfiguration({});

      const { result } = renderHook(
        () =>
          useChartSettingsValues({
            objectMetadataId: 'non-existent-object-id',
            configuration: config,
          }),
        {
          wrapper: ({ children }) => (
            <RecoilRoot
              initializeState={({ set }) => {
                set(objectMetadataItemsState, [mockObjectMetadataItem]);
              }}
            >
              {children}
            </RecoilRoot>
          ),
        },
      );

      const value = result.current.getChartSettingsValues(
        CHART_CONFIGURATION_SETTING_IDS.SOURCE,
      );

      expect(value).toBeUndefined();
    });
  });

  describe('Edge cases - Null/undefined orderBy', () => {
    it('should handle null primaryAxisOrderBy gracefully', () => {
      const config = buildBarChartConfiguration({
        primaryAxisOrderBy: null,
      });

      const { result } = renderUseChartSettingsValues(config);

      const value = result.current.getChartSettingsValues(
        CHART_CONFIGURATION_SETTING_IDS.PRIMARY_SORT_BY,
      );

      expect(value).toBeUndefined();
    });

    it('should handle null secondaryAxisOrderBy gracefully', () => {
      const config = buildBarChartConfiguration({
        secondaryAxisGroupByFieldMetadataId: 'field-stage',
        secondaryAxisOrderBy: null,
      });

      const { result } = renderUseChartSettingsValues(config);

      const value = result.current.getChartSettingsValues(
        CHART_CONFIGURATION_SETTING_IDS.SORT_BY_GROUP_BY_FIELD,
      );

      expect(value).toBeUndefined();
    });
  });

  describe('Edge cases - Missing axisNameDisplay', () => {
    it('should handle undefined axisNameDisplay gracefully', () => {
      const config = buildBarChartConfiguration({
        axisNameDisplay: undefined as any,
      });

      const { result } = renderUseChartSettingsValues(config);

      const value = result.current.getChartSettingsValues(
        CHART_CONFIGURATION_SETTING_IDS.AXIS_NAME,
      );

      expect(value).toBeUndefined();
    });
  });

  describe('Edge cases - Composite field with missing subfield', () => {
    it('should handle composite field without subfield gracefully', () => {
      const config = buildBarChartConfiguration({
        primaryAxisGroupByFieldMetadataId: 'field-full-name',
        primaryAxisGroupBySubFieldName: null,
      });

      const { result } = renderUseChartSettingsValues(config);

      const value = result.current.getChartSettingsValues(
        CHART_CONFIGURATION_SETTING_IDS.DATA_ON_DISPLAY_X,
      );

      expect(value).toBe('Full Name');
    });

    it('should handle invalid subfield name gracefully', () => {
      const config = buildBarChartConfiguration({
        primaryAxisGroupByFieldMetadataId: 'field-full-name',
        primaryAxisGroupBySubFieldName: 'invalidSubField' as any,
      });

      const { result } = renderUseChartSettingsValues(config);

      const value = result.current.getChartSettingsValues(
        CHART_CONFIGURATION_SETTING_IDS.DATA_ON_DISPLAY_X,
      );

      expect(value).toBeDefined();
      expect(typeof value).toBe('string');
    });
  });

  describe('Critical: Proves no swapping occurs', () => {
    it('horizontal bar with NULL secondary should still return primary for DATA_ON_DISPLAY_X', () => {
      const horizontalConfig = buildBarChartConfiguration({
        layout: BarChartLayout.HORIZONTAL,
        primaryAxisGroupByFieldMetadataId: 'field-company-name',
        secondaryAxisGroupByFieldMetadataId: null,
      });

      const { result } = renderUseChartSettingsValues(horizontalConfig);

      const value = result.current.getChartSettingsValues(
        CHART_CONFIGURATION_SETTING_IDS.DATA_ON_DISPLAY_X,
      );

      expect(value).toBe('Company Name');
      expect(value).not.toBeUndefined();
    });

    it('should return identical values for all settings regardless of orientation', () => {
      const baseConfig = {
        primaryAxisGroupByFieldMetadataId: 'field-company-name',
        secondaryAxisGroupByFieldMetadataId: 'field-stage',
        aggregateFieldMetadataId: 'field-amount',
        aggregateOperation: AggregateOperations.SUM,
        primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
        secondaryAxisOrderBy: GraphOrderBy.FIELD_DESC,
        axisNameDisplay: AxisNameDisplay.BOTH,
        displayDataLabel: true,
      };

      const verticalConfig = buildBarChartConfiguration({
        ...baseConfig,
        configurationType: WidgetConfigurationType.BAR_CHART,
        layout: BarChartLayout.VERTICAL,
      });

      const horizontalConfig = buildBarChartConfiguration({
        ...baseConfig,
        configurationType: WidgetConfigurationType.BAR_CHART,
        layout: BarChartLayout.HORIZONTAL,
      });

      const { result: verticalResult } =
        renderUseChartSettingsValues(verticalConfig);
      const { result: horizontalResult } =
        renderUseChartSettingsValues(horizontalConfig);

      // Test all setting IDs return IDENTICAL values
      const settingIds = [
        CHART_CONFIGURATION_SETTING_IDS.SOURCE,
        CHART_CONFIGURATION_SETTING_IDS.DATA_ON_DISPLAY_X,
        CHART_CONFIGURATION_SETTING_IDS.DATA_ON_DISPLAY_Y,
        CHART_CONFIGURATION_SETTING_IDS.GROUP_BY,
        CHART_CONFIGURATION_SETTING_IDS.PRIMARY_SORT_BY,
        CHART_CONFIGURATION_SETTING_IDS.SORT_BY_GROUP_BY_FIELD,
        CHART_CONFIGURATION_SETTING_IDS.AXIS_NAME,
        CHART_CONFIGURATION_SETTING_IDS.DATA_LABELS,
      ];

      settingIds.forEach((settingId) => {
        const verticalValue =
          verticalResult.current.getChartSettingsValues(settingId);
        const horizontalValue =
          horizontalResult.current.getChartSettingsValues(settingId);

        expect(verticalValue).toEqual(horizontalValue);
      });
    });
  });
});
