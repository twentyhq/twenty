import { type ChartConfiguration } from '@/command-menu/pages/page-layout/types/ChartConfiguration';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingIds';
import { type ChartSettingsItem } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { IconChartBar } from 'twenty-ui/display';
import { shouldHideChartSetting } from '@/command-menu/pages/page-layout/utils/shouldHideChartSetting';

describe('shouldHideChartSetting', () => {
  const mockItemWithoutDependencies: ChartSettingsItem = {
    id: CHART_CONFIGURATION_SETTING_IDS.DATA_LABELS,
    label: msg`Data Labels`,
    Icon: IconChartBar,
    isBoolean: true,
    isNumberInput: false,
  };

  const mockItemDependingOnSource: ChartSettingsItem = {
    id: CHART_CONFIGURATION_SETTING_IDS.DATA_ON_DISPLAY_X,
    label: msg`X Axis Data`,
    Icon: IconChartBar,
    isBoolean: false,
    isNumberInput: false,
    dependsOn: [CHART_CONFIGURATION_SETTING_IDS.SOURCE],
  };

  const mockItemDependingOnGroupBy: ChartSettingsItem = {
    id: CHART_CONFIGURATION_SETTING_IDS.SORT_BY_GROUP_BY_FIELD,
    label: msg`Sort By Group`,
    Icon: IconChartBar,
    isBoolean: false,
    isNumberInput: false,
    dependsOn: [CHART_CONFIGURATION_SETTING_IDS.GROUP_BY],
  };

  const mockItemWithMultipleDependencies: ChartSettingsItem = {
    id: CHART_CONFIGURATION_SETTING_IDS.DATA_ON_DISPLAY_X,
    label: msg`X Axis Data`,
    Icon: IconChartBar,
    isBoolean: false,
    isNumberInput: false,
    dependsOn: [
      CHART_CONFIGURATION_SETTING_IDS.SOURCE,
      CHART_CONFIGURATION_SETTING_IDS.GROUP_BY,
    ],
  };

  describe('item without dependencies', () => {
    it('should return false when item has no dependencies', () => {
      const result = shouldHideChartSetting(
        mockItemWithoutDependencies,
        'valid-object-id',
        true,
      );

      expect(result).toBe(false);
    });

    it('should return false when item has no dependencies even with no object metadata', () => {
      const result = shouldHideChartSetting(
        mockItemWithoutDependencies,
        '',
        false,
      );

      expect(result).toBe(false);
    });
  });

  describe('item depending on SOURCE', () => {
    it('should return true when no object metadata and item depends on SOURCE', () => {
      const result = shouldHideChartSetting(
        mockItemDependingOnSource,
        '',
        true,
      );

      expect(result).toBe(true);
    });

    it('should return false when object metadata exists and item depends on SOURCE', () => {
      const result = shouldHideChartSetting(
        mockItemDependingOnSource,
        'valid-object-id',
        true,
      );

      expect(result).toBe(false);
    });
  });

  describe('item depending on GROUP_BY', () => {
    it('should return true when group by is not enabled and item depends on GROUP_BY', () => {
      const result = shouldHideChartSetting(
        mockItemDependingOnGroupBy,
        'valid-object-id',
        false,
      );

      expect(result).toBe(true);
    });

    it('should return false when group by is enabled and item depends on GROUP_BY', () => {
      const result = shouldHideChartSetting(
        mockItemDependingOnGroupBy,
        'valid-object-id',
        true,
      );

      expect(result).toBe(false);
    });
  });

  describe('item with multiple dependencies', () => {
    it('should return true if any dependency is not met (no object metadata)', () => {
      const result = shouldHideChartSetting(
        mockItemWithMultipleDependencies,
        '',
        true,
      );

      expect(result).toBe(true);
    });

    it('should return true if any dependency is not met (group by disabled)', () => {
      const result = shouldHideChartSetting(
        mockItemWithMultipleDependencies,
        'valid-object-id',
        false,
      );

      expect(result).toBe(true);
    });

    it('should return false if all dependencies are met', () => {
      const result = shouldHideChartSetting(
        mockItemWithMultipleDependencies,
        'valid-object-id',
        true,
      );

      expect(result).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle undefined dependsOn array', () => {
      const itemWithUndefinedDependsOn: ChartSettingsItem = {
        id: CHART_CONFIGURATION_SETTING_IDS.DATA_LABELS,
        label: msg`Data Labels`,
        Icon: IconChartBar,
        isBoolean: true,
        isNumberInput: false,
        dependsOn: undefined,
      };

      const result = shouldHideChartSetting(
        itemWithUndefinedDependsOn,
        '',
        false,
      );

      expect(result).toBe(false);
    });

    it('should handle empty dependsOn array', () => {
      const itemWithEmptyDependsOn: ChartSettingsItem = {
        id: CHART_CONFIGURATION_SETTING_IDS.DATA_LABELS,
        label: msg`Data Labels`,
        Icon: IconChartBar,
        isBoolean: true,
        isNumberInput: false,
        dependsOn: [],
      };

      const result = shouldHideChartSetting(itemWithEmptyDependsOn, '', false);

      expect(result).toBe(false);
    });
  });

  describe('date granularity visibility based on field type', () => {
    const mockDateGranularityXItem: ChartSettingsItem = {
      id: CHART_CONFIGURATION_SETTING_IDS.DATE_GRANULARITY_X,
      label: msg`Date Granularity X`,
      Icon: IconChartBar,
      isBoolean: false,
      isNumberInput: false,
    };

    const mockDateGranularityYItem: ChartSettingsItem = {
      id: CHART_CONFIGURATION_SETTING_IDS.DATE_GRANULARITY_Y,
      label: msg`Date Granularity Y`,
      Icon: IconChartBar,
      isBoolean: false,
      isNumberInput: false,
    };

    const mockDateGranularityItem: ChartSettingsItem = {
      id: CHART_CONFIGURATION_SETTING_IDS.DATE_GRANULARITY,
      label: msg`Date Granularity`,
      Icon: IconChartBar,
      isBoolean: false,
      isNumberInput: false,
    };

    const mockObjectMetadataItem: ObjectMetadataItem = {
      id: 'object-id',
      nameSingular: 'opportunity',
      namePlural: 'opportunities',
      labelSingular: 'Opportunity',
      labelPlural: 'Opportunities',
      description: 'An opportunity',
      icon: 'IconTargetArrow',
      isActive: true,
      isSystem: false,
      isRemote: false,
      isAuditLogged: false,
      isLabelSyncedWithName: true,
      fields: [
        {
          id: 'date-field-id',
          name: 'closedAt',
          label: 'Closed At',
          type: FieldMetadataType.DATE,
          isNullable: true,
          isSystem: false,
          isActive: true,
          isCustom: false,
          defaultValue: null,
          options: null,
          relationDefinition: null,
        } as any,
        {
          id: 'text-field-id',
          name: 'name',
          label: 'Name',
          type: FieldMetadataType.TEXT,
          isNullable: true,
          isSystem: false,
          isActive: true,
          isCustom: false,
          defaultValue: null,
          options: null,
          relationDefinition: null,
        } as any,
        {
          id: 'datetime-field-id',
          name: 'createdAt',
          label: 'Created At',
          type: FieldMetadataType.DATE_TIME,
          isNullable: false,
          isSystem: true,
          isActive: true,
          isCustom: false,
          defaultValue: null,
          options: null,
          relationDefinition: null,
        } as any,
      ],
    } as any;

    describe('DATE_GRANULARITY_X', () => {
      it('should show when primary axis field is a date field', () => {
        const barChartConfig: ChartConfiguration = {
          __typename: 'BarChartConfiguration',
          primaryAxisGroupByFieldMetadataId: 'date-field-id',
        } as any;

        const result = shouldHideChartSetting(
          mockDateGranularityXItem,
          'object-id',
          true,
          barChartConfig,
          mockObjectMetadataItem,
        );

        expect(result).toBe(false);
      });

      it('should show when primary axis field is a datetime field', () => {
        const barChartConfig: ChartConfiguration = {
          __typename: 'BarChartConfiguration',
          primaryAxisGroupByFieldMetadataId: 'datetime-field-id',
        } as any;

        const result = shouldHideChartSetting(
          mockDateGranularityXItem,
          'object-id',
          true,
          barChartConfig,
          mockObjectMetadataItem,
        );

        expect(result).toBe(false);
      });

      it('should hide when primary axis field is not a date field', () => {
        const barChartConfig: ChartConfiguration = {
          __typename: 'BarChartConfiguration',
          primaryAxisGroupByFieldMetadataId: 'text-field-id',
        } as any;

        const result = shouldHideChartSetting(
          mockDateGranularityXItem,
          'object-id',
          true,
          barChartConfig,
          mockObjectMetadataItem,
        );

        expect(result).toBe(true);
      });

      it('should hide when no primary axis field is selected', () => {
        const barChartConfig: ChartConfiguration = {
          __typename: 'BarChartConfiguration',
          primaryAxisGroupByFieldMetadataId: undefined,
        } as any;

        const result = shouldHideChartSetting(
          mockDateGranularityXItem,
          'object-id',
          true,
          barChartConfig,
          mockObjectMetadataItem,
        );

        expect(result).toBe(true);
      });
    });

    describe('DATE_GRANULARITY_Y', () => {
      it('should show when secondary axis field is a date field', () => {
        const barChartConfig: ChartConfiguration = {
          __typename: 'BarChartConfiguration',
          secondaryAxisGroupByFieldMetadataId: 'date-field-id',
        } as any;

        const result = shouldHideChartSetting(
          mockDateGranularityYItem,
          'object-id',
          true,
          barChartConfig,
          mockObjectMetadataItem,
        );

        expect(result).toBe(false);
      });

      it('should hide when secondary axis field is not a date field', () => {
        const barChartConfig: ChartConfiguration = {
          __typename: 'BarChartConfiguration',
          secondaryAxisGroupByFieldMetadataId: 'text-field-id',
        } as any;

        const result = shouldHideChartSetting(
          mockDateGranularityYItem,
          'object-id',
          true,
          barChartConfig,
          mockObjectMetadataItem,
        );

        expect(result).toBe(true);
      });

      it('should hide when no secondary axis field is selected', () => {
        const barChartConfig: ChartConfiguration = {
          __typename: 'BarChartConfiguration',
          secondaryAxisGroupByFieldMetadataId: undefined,
        } as any;

        const result = shouldHideChartSetting(
          mockDateGranularityYItem,
          'object-id',
          true,
          barChartConfig,
          mockObjectMetadataItem,
        );

        expect(result).toBe(true);
      });
    });

    describe('DATE_GRANULARITY (Pie Chart)', () => {
      const relationField: any = {
        id: 'relation-field-id',
        name: 'company',
        label: 'Company',
        type: FieldMetadataType.RELATION,
        relation: { targetObjectMetadata: { nameSingular: 'company' } },
      };

      const targetObjectMetadata: any = {
        id: 'company-id',
        nameSingular: 'company',
        namePlural: 'companies',
        fields: [
          {
            id: 'company-created-at',
            name: 'createdAt',
            label: 'Created At',
            type: FieldMetadataType.DATE,
          },
        ],
      };

      it('should show when group by field is a date field', () => {
        const pieChartConfig: ChartConfiguration = {
          __typename: 'PieChartConfiguration',
          groupByFieldMetadataId: 'date-field-id',
        } as any;

        const result = shouldHideChartSetting(
          mockDateGranularityItem,
          'object-id',
          true,
          pieChartConfig,
          mockObjectMetadataItem,
        );

        expect(result).toBe(false);
      });

      it('should hide when group by field is not a date field', () => {
        const pieChartConfig: ChartConfiguration = {
          __typename: 'PieChartConfiguration',
          groupByFieldMetadataId: 'text-field-id',
        } as any;

        const result = shouldHideChartSetting(
          mockDateGranularityItem,
          'object-id',
          true,
          pieChartConfig,
          mockObjectMetadataItem,
        );

        expect(result).toBe(true);
      });

      it('should hide when no group by field is selected', () => {
        const pieChartConfig: ChartConfiguration = {
          __typename: 'PieChartConfiguration',
          groupByFieldMetadataId: undefined,
        } as any;

        const result = shouldHideChartSetting(
          mockDateGranularityItem,
          'object-id',
          true,
          pieChartConfig,
          mockObjectMetadataItem,
        );

        expect(result).toBe(true);
      });

      it('should show when group by field is a relation date subfield', () => {
        const objectMetadataItemWithRelation: ObjectMetadataItem = {
          ...mockObjectMetadataItem,
          fields: [...mockObjectMetadataItem.fields, relationField],
        } as any;

        const pieChartConfig: ChartConfiguration = {
          __typename: 'PieChartConfiguration',
          groupByFieldMetadataId: relationField.id,
          groupBySubFieldName: 'createdAt',
        } as any;

        const result = shouldHideChartSetting(
          mockDateGranularityItem,
          'object-id',
          true,
          pieChartConfig,
          objectMetadataItemWithRelation,
          [objectMetadataItemWithRelation, targetObjectMetadata] as any,
        );

        expect(result).toBe(false);
      });
    });
  });
});
