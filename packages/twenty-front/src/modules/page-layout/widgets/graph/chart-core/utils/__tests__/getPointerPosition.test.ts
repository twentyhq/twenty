import { getPointerPosition } from '@/page-layout/widgets/graph/chart-core/utils/getPointerPosition';

describe('getPointerPosition', () => {
  it('calculates offsets relative to the element bounds', () => {
    const element = {
      getBoundingClientRect: () => ({ left: 10, top: 20 }),
    } as HTMLElement;

    const position = getPointerPosition({
      event: { clientX: 35, clientY: 50 },
      element,
    });

    expect(position).toEqual({ x: 25, y: 30 });
  });
});
