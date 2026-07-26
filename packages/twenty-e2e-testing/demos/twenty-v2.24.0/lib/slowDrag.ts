import { type Locator, type Page } from '@playwright/test';

type Point = { x: number; y: number };

type SlowDragOptions = {
  from: Point;
  to: Point;
  steps?: number;
  stepDelay?: number;
  holdBeforeDrop?: number;
  onHover?: () => Promise<void>;
};

// dnd-kit only activates a drag past an 8px pointer travel, and a demo needs the
// drag to read as a movement rather than a teleport, so the pointer is walked to
// the target in small delayed steps.
export const slowDrag = async (
  page: Page,
  {
    from,
    to,
    steps = 40,
    stepDelay = 25,
    holdBeforeDrop = 1200,
    onHover,
  }: SlowDragOptions,
) => {
  await page.mouse.move(from.x, from.y);
  await page.waitForTimeout(300);
  await page.mouse.down();

  for (let step = 1; step <= steps; step++) {
    await page.mouse.move(
      from.x + ((to.x - from.x) * step) / steps,
      from.y + ((to.y - from.y) * step) / steps,
    );
    await page.waitForTimeout(stepDelay);
  }

  await page.waitForTimeout(holdBeforeDrop);
  await onHover?.();
  await page.mouse.up();
};

export const centerOf = async (locator: Locator): Promise<Point> => {
  const box = await locator.boundingBox();

  if (box === null) {
    throw new Error('Cannot drag an element without a bounding box');
  }

  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
};

export const grabPointOf = async (locator: Locator): Promise<Point> => {
  const box = await locator.boundingBox();

  if (box === null) {
    throw new Error('Cannot drag an element without a bounding box');
  }

  return { x: box.x + Math.min(box.width / 2, 60), y: box.y + 10 };
};
