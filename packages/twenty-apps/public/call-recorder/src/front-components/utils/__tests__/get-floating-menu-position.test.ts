import { describe, expect, it } from 'vitest';

import { getFloatingMenuPosition } from 'src/front-components/utils/get-floating-menu-position.util';

const baseParams = {
  anchorRect: { top: 100, left: 400, bottom: 124, width: 120 },
  menuWidth: 200,
  menuHeight: 320,
  viewportWidth: 1000,
  viewportHeight: 800,
};

describe('getFloatingMenuPosition', () => {
  it('drops the menu below the anchor and right-aligns it', async () => {
    await expect(getFloatingMenuPosition(baseParams)).resolves.toEqual({
      top: 128,
      left: 320,
    });
  });

  it('flips above the anchor when there is not enough room below', async () => {
    await expect(
      getFloatingMenuPosition({
        ...baseParams,
        anchorRect: { top: 600, left: 400, bottom: 624, width: 120 },
      }),
    ).resolves.toEqual({ top: 276, left: 320 });
  });

  it('keeps the menu inside the viewport horizontally', async () => {
    const position = await getFloatingMenuPosition({
      ...baseParams,
      anchorRect: { top: 100, left: 0, bottom: 124, width: 40 },
    });

    expect(position.left).toBe(8);
  });

  it('never positions the menu above the viewport margin', async () => {
    const position = await getFloatingMenuPosition({
      ...baseParams,
      anchorRect: { top: 10, left: 400, bottom: 30, width: 120 },
      viewportHeight: 200,
    });

    expect(position.top).toBe(8);
  });
});
