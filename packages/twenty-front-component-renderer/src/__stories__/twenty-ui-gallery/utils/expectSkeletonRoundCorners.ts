import { expect, within } from 'storybook/test';

export const expectSkeletonRoundCorners = async (
  canvasElement: HTMLElement,
) => {
  const canvas = within(canvasElement);
  const radii = {
    'round-skeleton': '4px',
    'medium-round-skeleton': '8px',
    'capsule-skeleton': '80px',
    'circle-skeleton': '50%',
  };

  for (const [name, radius] of Object.entries(radii)) {
    const placeholder = canvas.getByTestId(name);

    await expect(placeholder).toBeVisible();
    await expect(getComputedStyle(placeholder).borderRadius).toBe(radius);

    if (CSS.supports('corner-shape', 'squircle')) {
      await expect(
        getComputedStyle(placeholder).getPropertyValue('corner-shape'),
      ).toBe('round');
    }
  }
};
