import { getDefaultWidgetPosition } from '../getDefaultWidgetPosition';

describe('getDefaultWidgetPosition', () => {
  it('should return dragged area when provided', () => {
    const draggedArea = { x: 2, y: 3, w: 4, h: 5 };
    const defaultSize = { w: 2, h: 2 };

    expect(getDefaultWidgetPosition(draggedArea, defaultSize)).toEqual(
      draggedArea,
    );
  });

  it('should return default position with size when no dragged area', () => {
    const defaultSize = { w: 3, h: 4 };

    expect(getDefaultWidgetPosition(null, defaultSize)).toEqual({
      x: 0,
      y: 0,
      w: 3,
      h: 4,
    });
  });
});
