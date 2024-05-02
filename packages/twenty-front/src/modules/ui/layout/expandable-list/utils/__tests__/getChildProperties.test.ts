import { getChildrenProperties } from '@/ui/layout/expandable-list/utils/getChildProperties';

describe('getChildrenProperties', () => {
  it('should return default value when isFocused is False', () => {
    const isFocused = false;
    const availableWidth = 100;
    expect(getChildrenProperties(isFocused, availableWidth, {})).toEqual({});

    expect(
      getChildrenProperties(isFocused, availableWidth, { 0: 40, 1: 40 }),
    ).toEqual({});
  });

  it('should return proper value when isFocused is True', () => {
    const isFocused = true;
    const availableWidth = 100;
    expect(getChildrenProperties(isFocused, availableWidth, {})).toEqual({});

    expect(
      getChildrenProperties(isFocused, availableWidth, { 0: 40, 1: 40 }),
    ).toEqual({
      0: { shrink: 0, isVisible: true },
      1: { shrink: 0, isVisible: true },
    });
    expect(
      getChildrenProperties(isFocused, availableWidth, {
        0: 40,
        1: 40,
        2: 40,
        3: 40,
        4: 40,
      }),
    ).toEqual({
      0: { shrink: 0, isVisible: true },
      1: { shrink: 0, isVisible: true },
      2: { shrink: 1, isVisible: true },
      3: { shrink: 1, isVisible: false },
      4: { shrink: 1, isVisible: false },
    });
  });
});
