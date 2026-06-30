import { getDefaultWidgetPosition } from '@/page-layout/utils/getDefaultWidgetPosition';

describe('getDefaultWidgetPosition', () => {
  it('should return dragged area when it meets minimum size', () => {
    const draggedArea = { x: 2, y: 3, w: 4, h: 5 };
    const defaultSize = { w: 2, h: 2 };
    const minimumSize = { w: 3, h: 3 };

    expect(
      getDefaultWidgetPosition(draggedArea, defaultSize, minimumSize),
    ).toEqual(draggedArea);
  });

  it('should expand dragged area to meet minimum width', () => {
    const draggedArea = { x: 2, y: 3, w: 2, h: 5 };
    const defaultSize = { w: 4, h: 4 };
    const minimumSize = { w: 5, h: 3 };

    expect(
      getDefaultWidgetPosition(draggedArea, defaultSize, minimumSize),
    ).toEqual({
      x: 2,
      y: 3,
      w: 5, // expanded from 2 to meet minimum
      h: 5,
    });
  });

  it('should expand dragged area to meet minimum height', () => {
    const draggedArea = { x: 1, y: 2, w: 6, h: 2 };
    const defaultSize = { w: 4, h: 4 };
    const minimumSize = { w: 3, h: 5 };

    expect(
      getDefaultWidgetPosition(draggedArea, defaultSize, minimumSize),
    ).toEqual({
      x: 1,
      y: 2,
      w: 6,
      h: 5, // expanded from 2 to meet minimum
    });
  });

  it('should expand dragged area to meet both minimum dimensions', () => {
    const draggedArea = { x: 0, y: 0, w: 2, h: 2 };
    const defaultSize = { w: 6, h: 6 };
    const minimumSize = { w: 5, h: 5 };

    expect(
      getDefaultWidgetPosition(draggedArea, defaultSize, minimumSize),
    ).toEqual({
      x: 0,
      y: 0,
      w: 5, // expanded from 2 to meet minimum
      h: 5, // expanded from 2 to meet minimum
    });
  });

  it('should return default position with size when no dragged area', () => {
    const defaultSize = { w: 3, h: 4 };
    const minimumSize = { w: 2, h: 2 };

    expect(getDefaultWidgetPosition(null, defaultSize, minimumSize)).toEqual({
      x: 0,
      y: 0,
      w: 3,
      h: 4,
    });
  });
});
