import { getWidgetSize } from '@/page-layout/utils/getWidgetSize';
import { updateLayoutItemConstraints } from '@/page-layout/utils/updateLayoutItemConstraints';
import { updateWidgetMinimumSizeForGraphType } from '@/page-layout/utils/updateWidgetMinimumSizeForGraphType';
import { type Layouts } from 'react-grid-layout';
import { WidgetConfigurationType } from '~/generated/graphql';

jest.mock('../getWidgetSize');
jest.mock('../updateLayoutItemConstraints');

describe('updateWidgetMinimumSizeForGraphType', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update widget minimum size for a valid graph type and existing tab', () => {
    const mockLayouts: Record<string, Layouts> = {
      'tab-1': {
        desktop: [{ i: 'widget-1', x: 0, y: 0, w: 4, h: 3 }],
      },
      'tab-2': {
        desktop: [{ i: 'widget-2', x: 0, y: 0, w: 4, h: 3 }],
      },
    };

    const updatedLayouts: Layouts = {
      desktop: [{ i: 'widget-1', x: 0, y: 0, w: 4, h: 3, minW: 3, minH: 2 }],
    };

    (getWidgetSize as jest.Mock).mockReturnValue({ w: 3, h: 2 });
    (updateLayoutItemConstraints as jest.Mock).mockReturnValue(updatedLayouts);

    const result = updateWidgetMinimumSizeForGraphType({
      configurationType: WidgetConfigurationType.PIE_CHART,
      widgetId: 'widget-1',
      tabId: 'tab-1',
      currentLayouts: mockLayouts,
    });

    expect(getWidgetSize).toHaveBeenCalledWith(
      WidgetConfigurationType.PIE_CHART,
      'minimum',
    );
    expect(updateLayoutItemConstraints).toHaveBeenCalledWith(
      mockLayouts['tab-1'],
      'widget-1',
      { minW: 3, minH: 2 },
    );
    expect(result).toEqual({
      'tab-1': updatedLayouts,
      'tab-2': mockLayouts['tab-2'],
    });
  });

  it('should return original layouts when tab does not exist', () => {
    const mockLayouts: Record<string, Layouts> = {
      'tab-1': {
        desktop: [{ i: 'widget-1', x: 0, y: 0, w: 4, h: 3 }],
      },
    };

    (getWidgetSize as jest.Mock).mockReturnValue({ w: 3, h: 2 });

    const result = updateWidgetMinimumSizeForGraphType({
      configurationType: WidgetConfigurationType.BAR_CHART,
      widgetId: 'widget-2',
      tabId: 'non-existent-tab',
      currentLayouts: mockLayouts,
    });
    expect(getWidgetSize).toHaveBeenCalledWith(
      WidgetConfigurationType.BAR_CHART,
      'minimum',
    );
    expect(updateLayoutItemConstraints).not.toHaveBeenCalled();
    expect(result).toEqual(mockLayouts);
  });

  it('should handle different graph types correctly', () => {
    const mockLayouts: Record<string, Layouts> = {
      'tab-1': {
        desktop: [{ i: 'widget-1', x: 0, y: 0, w: 4, h: 3 }],
      },
    };

    const configurationTypes = [
      WidgetConfigurationType.AGGREGATE_CHART,
      WidgetConfigurationType.GAUGE_CHART,
      WidgetConfigurationType.PIE_CHART,
      WidgetConfigurationType.BAR_CHART,
      WidgetConfigurationType.LINE_CHART,
    ];

    configurationTypes.forEach((configurationType, index) => {
      const mockSize = { w: index + 2, h: index + 1 };
      (getWidgetSize as jest.Mock).mockReturnValue(mockSize);
      (updateLayoutItemConstraints as jest.Mock).mockReturnValue({
        desktop: [
          {
            i: 'widget-1',
            x: 0,
            y: 0,
            w: 4,
            h: 3,
            minW: mockSize.w,
            minH: mockSize.h,
          },
        ],
      });

      const result = updateWidgetMinimumSizeForGraphType({
        configurationType,
        widgetId: 'widget-1',
        tabId: 'tab-1',
        currentLayouts: mockLayouts,
      });

      expect(getWidgetSize).toHaveBeenCalledWith(configurationType, 'minimum');
      expect(updateLayoutItemConstraints).toHaveBeenCalledWith(
        mockLayouts['tab-1'],
        'widget-1',
        { minW: mockSize.w, minH: mockSize.h },
      );
      expect(result['tab-1']).toBeDefined();
    });
  });

  it('should preserve other tabs when updating a specific tab', () => {
    const mockLayouts: Record<string, Layouts> = {
      'tab-1': {
        desktop: [{ i: 'widget-1', x: 0, y: 0, w: 4, h: 3 }],
      },
      'tab-2': {
        desktop: [{ i: 'widget-2', x: 0, y: 0, w: 5, h: 4 }],
      },
      'tab-3': {
        desktop: [{ i: 'widget-3', x: 0, y: 0, w: 6, h: 5 }],
      },
    };

    const updatedTab2Layouts: Layouts = {
      desktop: [{ i: 'widget-2', x: 0, y: 0, w: 5, h: 4, minW: 4, minH: 3 }],
    };

    (getWidgetSize as jest.Mock).mockReturnValue({ w: 4, h: 3 });
    (updateLayoutItemConstraints as jest.Mock).mockReturnValue(
      updatedTab2Layouts,
    );

    const result = updateWidgetMinimumSizeForGraphType({
      configurationType: WidgetConfigurationType.LINE_CHART,
      widgetId: 'widget-2',
      tabId: 'tab-2',
      currentLayouts: mockLayouts,
    });

    expect(result).toEqual({
      'tab-1': mockLayouts['tab-1'],
      'tab-2': updatedTab2Layouts,
      'tab-3': mockLayouts['tab-3'],
    });
  });

  it('should handle empty layouts object', () => {
    const mockLayouts: Record<string, Layouts> = {};

    (getWidgetSize as jest.Mock).mockReturnValue({ w: 3, h: 2 });

    const result = updateWidgetMinimumSizeForGraphType({
      configurationType: WidgetConfigurationType.PIE_CHART,
      widgetId: 'widget-1',
      tabId: 'tab-1',
      currentLayouts: mockLayouts,
    });

    expect(updateLayoutItemConstraints).not.toHaveBeenCalled();
    expect(result).toEqual({});
  });

  it('should handle layouts with both desktop and mobile', () => {
    const mockLayouts: Record<string, Layouts> = {
      'tab-1': {
        desktop: [{ i: 'widget-1', x: 0, y: 0, w: 4, h: 3 }],
        mobile: [{ i: 'widget-1', x: 0, y: 0, w: 2, h: 2 }],
      },
    };

    const updatedLayouts: Layouts = {
      desktop: [{ i: 'widget-1', x: 0, y: 0, w: 4, h: 3, minW: 3, minH: 2 }],
      mobile: [{ i: 'widget-1', x: 0, y: 0, w: 2, h: 2, minW: 3, minH: 2 }],
    };

    (getWidgetSize as jest.Mock).mockReturnValue({ w: 3, h: 2 });
    (updateLayoutItemConstraints as jest.Mock).mockReturnValue(updatedLayouts);

    const result = updateWidgetMinimumSizeForGraphType({
      configurationType: WidgetConfigurationType.GAUGE_CHART,
      widgetId: 'widget-1',
      tabId: 'tab-1',
      currentLayouts: mockLayouts,
    });

    expect(result['tab-1']).toEqual(updatedLayouts);
  });

  it('should handle widget not found in tab layouts', () => {
    const mockLayouts: Record<string, Layouts> = {
      'tab-1': {
        desktop: [{ i: 'widget-1', x: 0, y: 0, w: 4, h: 3 }],
      },
    };

    const unchangedLayouts = mockLayouts['tab-1'];

    (getWidgetSize as jest.Mock).mockReturnValue({ w: 3, h: 2 });
    (updateLayoutItemConstraints as jest.Mock).mockReturnValue(
      unchangedLayouts,
    );

    const result = updateWidgetMinimumSizeForGraphType({
      configurationType: WidgetConfigurationType.PIE_CHART,
      widgetId: 'widget-non-existent',
      tabId: 'tab-1',
      currentLayouts: mockLayouts,
    });

    expect(updateLayoutItemConstraints).toHaveBeenCalledWith(
      mockLayouts['tab-1'],
      'widget-non-existent',
      { minW: 3, minH: 2 },
    );
    expect(result['tab-1']).toEqual(unchangedLayouts);
  });

  it('should call updateLayoutItemConstraints with correct parameters', () => {
    const mockLayouts: Record<string, Layouts> = {
      'tab-1': {
        desktop: [
          { i: 'widget-1', x: 0, y: 0, w: 4, h: 3 },
          { i: 'widget-2', x: 4, y: 0, w: 4, h: 3 },
        ],
      },
    };

    (getWidgetSize as jest.Mock).mockReturnValue({ w: 5, h: 4 });
    (updateLayoutItemConstraints as jest.Mock).mockReturnValue({
      desktop: [
        { i: 'widget-1', x: 0, y: 0, w: 4, h: 3 },
        { i: 'widget-2', x: 4, y: 0, w: 4, h: 3, minW: 5, minH: 4 },
      ],
    });

    updateWidgetMinimumSizeForGraphType({
      configurationType: WidgetConfigurationType.BAR_CHART,
      widgetId: 'widget-2',
      tabId: 'tab-1',
      currentLayouts: mockLayouts,
    });

    expect(updateLayoutItemConstraints).toHaveBeenCalledWith(
      mockLayouts['tab-1'],
      'widget-2',
      { minW: 5, minH: 4 },
    );
  });

  it('should handle undefined tab layouts gracefully', () => {
    const mockLayouts: Record<string, Layouts> = {
      'tab-1': {
        desktop: [{ i: 'widget-1', x: 0, y: 0, w: 4, h: 3 }],
      },
      'tab-2': undefined as any, // Simulating an edge case
    };

    (getWidgetSize as jest.Mock).mockReturnValue({ w: 3, h: 2 });

    const result = updateWidgetMinimumSizeForGraphType({
      configurationType: WidgetConfigurationType.PIE_CHART,
      widgetId: 'widget-1',
      tabId: 'tab-2',
      currentLayouts: mockLayouts,
    });

    expect(updateLayoutItemConstraints).not.toHaveBeenCalled();
    expect(result).toEqual(mockLayouts);
  });
});
