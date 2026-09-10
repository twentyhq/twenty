import { isWidgetCardFlushInViewMode } from '@/page-layout/widgets/utils/isWidgetCardFlushInViewMode';

describe('isWidgetCardFlushInViewMode', () => {
  it('returns true for a non-editable flush card', () => {
    expect(
      isWidgetCardFlushInViewMode({ isEditable: false, variant: 'flush' }),
    ).toBe(true);
  });

  it.each([
    { isEditable: true, variant: 'flush' as const },
    { isEditable: false, variant: 'framed' as const },
  ])('returns false for $variant with isEditable=$isEditable', (params) => {
    expect(isWidgetCardFlushInViewMode(params)).toBe(false);
  });
});
