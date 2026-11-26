import { EMPTY_CONDITIONAL_AVAILABILITY_CURRENT_USER_CONTEXT } from '@/conditional-availability/constants/EmptyConditionalAvailabilityCurrentUserContext';
import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { filterVisibleWidgets } from '@/page-layout/utils/filterVisibleWidgets';
import { buildDeviceConditionalEvaluationNode } from 'twenty-shared/conditional-evaluation';
import {
  FeatureFlagKey,
  PageLayoutTabLayoutMode,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

describe('filterVisibleWidgets', () => {
  const createMockWidget = (
    id: string,
    conditionalDisplay?: any,
  ): PageLayoutTab['widgets'][0] => ({
    isSystemSideEffect: false,
    universalIdentifier: 'universal-identifier-mock',
    __typename: 'PageLayoutWidget',
    id,
    applicationId: '',
    isActive: true,
    pageLayoutTabId: 'tab-1',
    title: `Widget ${id}`,
    type: WidgetType.FIELDS,
    objectMetadataId: null,
    position: {
      layoutMode: PageLayoutTabLayoutMode.GRID,
      __typename: 'PageLayoutWidgetGridPosition',
      row: 0,
      column: 0,
      rowSpan: 1,
      columnSpan: 1,
    },
    configuration: {
      __typename: 'FieldsConfiguration',
      configurationType: WidgetConfigurationType.FIELDS,
      viewId: null,
    },
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    deletedAt: null,
    conditionalDisplay,
  });

  it('should return all widgets when no conditionalDisplay is set', () => {
    const widgets = [
      createMockWidget('widget-1'),
      createMockWidget('widget-2'),
      createMockWidget('widget-3'),
    ];

    const result = filterVisibleWidgets({
      widgets,
      context: {
        ...EMPTY_CONDITIONAL_AVAILABILITY_CURRENT_USER_CONTEXT,
        device: 'DESKTOP',
        selectedRecords: [],
      },
    });

    expect(result).toHaveLength(3);
    expect(result).toEqual(widgets);
  });

  it('should filter out widgets that should be hidden on MOBILE', () => {
    const widgets = [
      createMockWidget('widget-1'),
      createMockWidget('widget-2', {
        and: [{ '===': [{ var: 'device' }, 'MOBILE'] }],
      }),
      createMockWidget('widget-3', {
        and: [{ '===': [{ var: 'device' }, 'DESKTOP'] }],
      }),
    ];

    const result = filterVisibleWidgets({
      widgets,
      context: {
        ...EMPTY_CONDITIONAL_AVAILABILITY_CURRENT_USER_CONTEXT,
        device: 'MOBILE',
        selectedRecords: [],
      },
    });

    expect(result).toHaveLength(2);
    expect(result.map((w) => w.id)).toEqual(['widget-1', 'widget-2']);
  });

  it('should filter out widgets that should be hidden on DESKTOP', () => {
    const widgets = [
      createMockWidget('widget-1'),
      createMockWidget('widget-2', {
        and: [{ '===': [{ var: 'device' }, 'MOBILE'] }],
      }),
      createMockWidget('widget-3', {
        and: [{ '===': [{ var: 'device' }, 'DESKTOP'] }],
      }),
    ];

    const result = filterVisibleWidgets({
      widgets,
      context: {
        ...EMPTY_CONDITIONAL_AVAILABILITY_CURRENT_USER_CONTEXT,
        device: 'DESKTOP',
        selectedRecords: [],
      },
    });

    expect(result).toHaveLength(2);
    expect(result.map((w) => w.id)).toEqual(['widget-1', 'widget-3']);
  });

  it('should handle empty widgets array', () => {
    const result = filterVisibleWidgets({
      widgets: [],
      context: {
        ...EMPTY_CONDITIONAL_AVAILABILITY_CURRENT_USER_CONTEXT,
        device: 'DESKTOP',
        selectedRecords: [],
      },
    });

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  it('should not mutate the original widgets array', () => {
    const widgets = [
      createMockWidget('widget-1'),
      createMockWidget('widget-2', {
        and: [{ '===': [{ var: 'device' }, 'MOBILE'] }],
      }),
    ];
    const originalLength = widgets.length;

    filterVisibleWidgets({
      widgets,
      context: {
        ...EMPTY_CONDITIONAL_AVAILABILITY_CURRENT_USER_CONTEXT,
        device: 'DESKTOP',
        selectedRecords: [],
      },
    });

    expect(widgets).toHaveLength(originalLength);
  });

  describe('when the workspace reads the conditional availability tree only', () => {
    const context = {
      ...EMPTY_CONDITIONAL_AVAILABILITY_CURRENT_USER_CONTEXT,
      device: 'DESKTOP' as const,
      selectedRecords: [],
      featureFlags: {
        [FeatureFlagKey.IS_WIDGET_CONDITIONAL_AVAILABILITY_ENABLED]: true,
      },
    };

    it('should hide a widget whose tree does not match', () => {
      const widgets = [
        createMockWidget('widget-1'),
        {
          ...createMockWidget('widget-2'),
          conditionalAvailability:
            buildDeviceConditionalEvaluationNode('MOBILE'),
        },
      ];

      const result = filterVisibleWidgets({ widgets, context });

      expect(result.map((widget) => widget.id)).toEqual(['widget-1']);
    });

    it('should ignore the legacy rules of a widget', () => {
      const widgets = [
        createMockWidget('widget-1', {
          and: [{ '===': [{ var: 'device' }, 'MOBILE'] }],
        }),
        {
          ...createMockWidget('widget-2'),
          conditionalAvailabilityExpression: 'device == "MOBILE"',
        },
      ];

      const result = filterVisibleWidgets({ widgets, context });

      expect(result.map((widget) => widget.id)).toEqual([
        'widget-1',
        'widget-2',
      ]);
    });

    it('should apply a rule on the role of the current workspace member', () => {
      const buildWidgetForRole = ({
        id,
        roleUniversalIdentifier,
      }: {
        id: string;
        roleUniversalIdentifier: string;
      }) => ({
        ...createMockWidget(id),
        conditionalAvailability: {
          type: 'COMPARISON' as const,
          operator: 'EQUAL' as const,
          left: {
            type: 'VARIABLE' as const,
            path: 'currentRole.universalIdentifier',
          },
          right: { type: 'LITERAL' as const, value: roleUniversalIdentifier },
        },
      });

      const result = filterVisibleWidgets({
        widgets: [
          buildWidgetForRole({
            id: 'widget-for-sales',
            roleUniversalIdentifier: 'sales-role-universal-identifier',
          }),
          buildWidgetForRole({
            id: 'widget-for-support',
            roleUniversalIdentifier: 'support-role-universal-identifier',
          }),
        ],
        context: {
          ...context,
          currentRole: {
            universalIdentifier: 'sales-role-universal-identifier',
          },
        },
      });

      expect(result.map((widget) => widget.id)).toEqual(['widget-for-sales']);
    });

    it('should evaluate a rule on the role while the role is not loaded', () => {
      const roleIsSales = {
        type: 'COMPARISON' as const,
        operator: 'EQUAL' as const,
        left: {
          type: 'VARIABLE' as const,
          path: 'currentRole.universalIdentifier',
        },
        right: {
          type: 'LITERAL' as const,
          value: 'sales-role-universal-identifier',
        },
      };
      const deviceIsDesktop = buildDeviceConditionalEvaluationNode('DESKTOP');

      const result = filterVisibleWidgets({
        widgets: [
          {
            ...createMockWidget('widget-for-sales'),
            conditionalAvailability: roleIsSales,
          },
          {
            ...createMockWidget('widget-for-everyone-but-sales'),
            conditionalAvailability: {
              ...roleIsSales,
              operator: 'NOT_EQUAL' as const,
            },
          },
          {
            ...createMockWidget('widget-for-sales-or-desktop'),
            conditionalAvailability: {
              type: 'GROUP' as const,
              logicalOperator: 'OR' as const,
              children: [roleIsSales, deviceIsDesktop],
            },
          },
          {
            ...createMockWidget('widget-for-desktop-or-sales'),
            conditionalAvailability: {
              type: 'GROUP' as const,
              logicalOperator: 'OR' as const,
              children: [deviceIsDesktop, roleIsSales],
            },
          },
        ],
        context,
      });

      expect(result.map((widget) => widget.id)).toEqual([
        'widget-for-everyone-but-sales',
        'widget-for-sales-or-desktop',
        'widget-for-desktop-or-sales',
      ]);
    });
  });
});
