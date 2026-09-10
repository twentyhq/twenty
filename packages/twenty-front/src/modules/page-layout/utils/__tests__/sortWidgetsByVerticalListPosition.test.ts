import { makeWidget } from '@/page-layout/testing/pageLayoutDraftFixtures';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { sortWidgetsByVerticalListPosition } from '@/page-layout/utils/sortWidgetsByVerticalListPosition';

describe('sortWidgetsByVerticalListPosition', () => {
  it('should sort widgets by index ascending', () => {
    const widgets = [
      makeWidget('c', 2),
      makeWidget('a', 0),
      makeWidget('b', 1),
    ];

    const sorted = sortWidgetsByVerticalListPosition(widgets);

    expect(sorted.map((w) => w.id)).toEqual(['a', 'b', 'c']);
  });

  it('should not mutate the original array', () => {
    const widgets = [makeWidget('b', 1), makeWidget('a', 0)];
    const original = [...widgets];

    sortWidgetsByVerticalListPosition(widgets);

    expect(widgets.map((w) => w.id)).toEqual(original.map((w) => w.id));
  });

  it('should handle widgets with undefined positions by treating as index 0', () => {
    const widgetWithPosition = makeWidget('b', 1);
    const widgetWithoutPosition = {
      ...makeWidget('a', 0),
      position: undefined,
    } as unknown as PageLayoutWidget;

    const sorted = sortWidgetsByVerticalListPosition([
      widgetWithPosition,
      widgetWithoutPosition,
    ]);

    expect(sorted.map((w) => w.id)).toEqual(['a', 'b']);
  });

  it('should return empty array when given empty array', () => {
    expect(sortWidgetsByVerticalListPosition([])).toEqual([]);
  });

  it('should handle single widget', () => {
    const widgets = [makeWidget('a', 0)];

    const sorted = sortWidgetsByVerticalListPosition(widgets);

    expect(sorted.map((w) => w.id)).toEqual(['a']);
  });
});
