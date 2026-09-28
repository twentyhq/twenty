import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { MOUNT_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const readingDirectionsTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  for (const direction of ['ltr', 'rtl']) {
    const scope = await canvas.findByTestId(
      `layout-${direction}`,
      {},
      { timeout: MOUNT_TIMEOUT },
    );
    const content = within(scope);
    const first = content.getByRole('button', { name: 'First action' });
    const last = content.getByRole('button', { name: 'Last action' });
    expect(getComputedStyle(scope).direction).toBe(direction);
    expect(
      first.getBoundingClientRect().left > last.getBoundingClientRect().left,
    ).toBe(direction === 'rtl');
    expect(getComputedStyle(first).borderStartEndRadius).toBe('0px');
    const description = content
      .getByText('Review the information before continuing.')
      .closest('[class*="descriptionWrapper"]')!;
    await waitFor(() =>
      expect(getComputedStyle(description).paddingInlineStart).toBe('24px'),
    );
    await userEvent.click(content.getByRole('button', { name: 'Dark' }));
    for (const variant of ['Light', 'Dark', 'System']) {
      const badge = content.getByRole('button', {
        name: variant,
      }).nextElementSibling!;
      await waitFor(() =>
        expect(getComputedStyle(badge).visibility).toBe(
          variant === 'Dark' ? 'visible' : 'hidden',
        ),
      );
    }
    const row = content
      .getByText('A very long account name that must truncate')
      .closest('[data-indicator]')!;
    expect(getComputedStyle(row.lastElementChild!).transform).toBe(
      direction === 'rtl' ? 'matrix(-1, 0, 0, 1, 0, 0)' : 'none',
    );
    for (const overlap of ['left', 'right']) {
      const group = content.getByTestId(
        `avatars-${overlap}`,
      ).firstElementChild!;
      const boxes = Array.from(group.children).map((child) =>
        child.getBoundingClientRect(),
      );
      const physicalBoxes = boxes.sort(
        (firstBox, secondBox) => firstBox.left - secondBox.left,
      );
      for (let index = 1; index < physicalBoxes.length; index++) {
        expect(
          Math.round(
            physicalBoxes[index - 1]!.right - physicalBoxes[index]!.left,
          ),
        ).toBe(3);
      }
    }
    const collapse = content.getAllByRole('button', {
      name: 'Collapse node',
    })[0];
    await userEvent.click(collapse);
    const expand = await content.findByRole('button', { name: 'Expand node' });
    await waitFor(() =>
      expect(getComputedStyle(expand.lastElementChild!).transform).toBe(
        direction === 'rtl'
          ? 'matrix(0, 1, -1, 0, 0, 0)'
          : 'matrix(0, -1, 1, 0, 0, 0)',
      ),
    );
  }
  expect(errorHandler).not.toHaveBeenCalled();
};
