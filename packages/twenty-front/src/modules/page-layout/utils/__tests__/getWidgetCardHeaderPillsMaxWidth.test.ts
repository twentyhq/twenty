import { getWidgetCardHeaderPillsMaxWidth } from '@/page-layout/utils/getWidgetCardHeaderPillsMaxWidth';

describe('getWidgetCardHeaderPillsMaxWidth', () => {
  it('should give the pills all the room a short title leaves', () => {
    expect(
      getWidgetCardHeaderPillsMaxWidth({
        headerWidth: 300,
        titleWidth: 280,
        titleNaturalWidth: 100,
        pillsWidth: 20,
      }),
    ).toBe(200);
  });

  it('should cap the pills at their share when the title needs more room', () => {
    expect(
      getWidgetCardHeaderPillsMaxWidth({
        headerWidth: 300,
        titleWidth: 280,
        titleNaturalWidth: 290,
        pillsWidth: 20,
      }),
    ).toBe(180);
  });
});
