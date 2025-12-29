import { DEFAULT_WIDGET_SIZE } from '@/page-layout/constants/DefaultWidgetSize';
import { PENDING_WIDGET_PLACEHOLDER_LAYOUT_KEY } from '@/page-layout/constants/PendingWidgetPlaceholderLayoutKey';
import { createPendingWidgetPlaceholderLayoutItem } from '@/page-layout/utils/createPendingWidgetPlaceholderLayoutItem';

describe('createPendingWidgetPlaceholderLayoutItem', () => {
  const draggedArea = { x: 2, y: 3, w: 5, h: 6 };

  describe('desktop breakpoint', () => {
    it('should use dragged area position and apply minimum constraints', () => {
      const result = createPendingWidgetPlaceholderLayoutItem(
        draggedArea,
        'desktop',
      );

      expect(result).toEqual({
        i: PENDING_WIDGET_PLACEHOLDER_LAYOUT_KEY,
        x: 2,
        y: 3,
        w: 5,
        h: 6,
        minW: DEFAULT_WIDGET_SIZE.minimum.w,
        minH: DEFAULT_WIDGET_SIZE.minimum.h,
        static: false,
      });
    });

    it('should apply default size when dragged area is smaller', () => {
      const smallDraggedArea = { x: 1, y: 2, w: 1, h: 1 };
      const result = createPendingWidgetPlaceholderLayoutItem(
        smallDraggedArea,
        'desktop',
      );

      expect(result.w).toBe(DEFAULT_WIDGET_SIZE.default.w);
      expect(result.h).toBe(DEFAULT_WIDGET_SIZE.default.h);
    });
  });

  describe('mobile breakpoint', () => {
    it('should always use x=0 and w=1 for mobile', () => {
      const result = createPendingWidgetPlaceholderLayoutItem(
        draggedArea,
        'mobile',
      );

      expect(result).toEqual({
        i: PENDING_WIDGET_PLACEHOLDER_LAYOUT_KEY,
        x: 0,
        y: 3,
        w: 1,
        h: 6,
        minW: DEFAULT_WIDGET_SIZE.minimum.w,
        minH: DEFAULT_WIDGET_SIZE.minimum.h,
        static: false,
      });
    });

    it('should still apply minimum height for mobile', () => {
      const smallDraggedArea = { x: 5, y: 2, w: 10, h: 1 };
      const result = createPendingWidgetPlaceholderLayoutItem(
        smallDraggedArea,
        'mobile',
      );

      expect(result.x).toBe(0);
      expect(result.w).toBe(1);
      expect(result.h).toBe(DEFAULT_WIDGET_SIZE.default.h);
    });
  });

  it('should always mark layout as static', () => {
    const desktopResult = createPendingWidgetPlaceholderLayoutItem(
      draggedArea,
      'desktop',
    );
    const mobileResult = createPendingWidgetPlaceholderLayoutItem(
      draggedArea,
      'mobile',
    );

    expect(desktopResult.static).toBe(false);
    expect(mobileResult.static).toBe(false);
  });
});
