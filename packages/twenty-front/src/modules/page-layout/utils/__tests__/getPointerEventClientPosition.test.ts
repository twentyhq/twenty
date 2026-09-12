import { getPointerEventClientPosition } from '@/page-layout/utils/getPointerEventClientPosition';

describe('getPointerEventClientPosition', () => {
  it('should extract coordinates from a mouse event', () => {
    const event = new MouseEvent('mouseup', { clientX: 120, clientY: 240 });

    expect(getPointerEventClientPosition(event)).toEqual({
      clientX: 120,
      clientY: 240,
    });
  });

  it('should extract coordinates from a touch event ending touch', () => {
    const event = Object.assign(new Event('touchend'), {
      changedTouches: [{ clientX: 60, clientY: 80 }],
    });

    expect(getPointerEventClientPosition(event)).toEqual({
      clientX: 60,
      clientY: 80,
    });
  });

  it('should return null for a touch event without touches', () => {
    const event = Object.assign(new Event('touchend'), { changedTouches: [] });

    expect(getPointerEventClientPosition(event)).toBeNull();
  });

  it('should return null for an event without pointer coordinates', () => {
    expect(getPointerEventClientPosition(new Event('scroll'))).toBeNull();
  });
});
