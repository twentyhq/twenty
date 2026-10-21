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
    for (const scopeName of ['Inherited', 'Nested']) {
      const handle = content.getByRole('separator', {
        name: `${scopeName} ${direction} resize`,
      });
      const isRightToLeft =
        scopeName === 'Inherited' ? direction === 'rtl' : direction === 'ltr';
      handle.focus();
      await userEvent.keyboard('{ArrowRight}');
      await waitFor(() =>
        expect(handle).toHaveAttribute(
          'aria-valuenow',
          isRightToLeft ? '90' : '110',
        ),
      );
    }
    const first = content.getByRole('button', { name: 'First action' });
    const last = content.getByRole('button', { name: 'Last action' });
    expect(getComputedStyle(scope).direction).toBe(direction);
    expect(
      first.getBoundingClientRect().left > last.getBoundingClientRect().left,
    ).toBe(direction === 'rtl');
    expect(getComputedStyle(first).borderStartEndRadius).toBe('0px');
    const upcoming = content.getByRole('button', {
      name: 'Upcoming action Soon',
    });
    expect(upcoming).toBeDisabled();
    const upcomingLabel = content.getByText('Soon');
    expect(
      upcomingLabel.getBoundingClientRect().left <
        upcoming.getBoundingClientRect().left +
          upcoming.getBoundingClientRect().width / 2,
    ).toBe(direction === 'rtl');
    const title = content.getByText('Account details');
    const description = content.getByText(
      'Review the information before continuing.',
    );
    await waitFor(() => {
      const titleBox = title.getBoundingClientRect();
      const descriptionBox = description.getBoundingClientRect();
      expect(Math.abs(descriptionBox.left - titleBox.left)).toBeLessThan(1);
      expect(Math.abs(descriptionBox.right - titleBox.right)).toBeLessThan(1);
    });
    const row = content
      .getByText('A very long account name that must truncate')
      .closest('[data-indicator]')!;
    expect(getComputedStyle(row.querySelector(':scope > svg')!).transform).toBe(
      direction === 'rtl' ? 'matrix(-1, 0, 0, 1, 0, 0)' : 'none',
    );
    for (const overlap of ['left', 'right']) {
      const group = content.getByTestId(
        `avatars-${overlap}`,
      ).firstElementChild!;
      const groupBox = group.getBoundingClientRect();
      const physicalBoxes = Array.from(group.children)
        .map((child) => child.getBoundingClientRect())
        .sort((firstBox, secondBox) => firstBox.left - secondBox.left);
      for (let index = 1; index < physicalBoxes.length; index++) {
        expect(
          Math.round(
            physicalBoxes[index - 1]!.right - physicalBoxes[index]!.left,
          ),
        ).toBe(3);
      }
      expect(Math.abs(physicalBoxes[0]!.left - groupBox.left)).toBeLessThan(1);
      expect(
        Math.abs(
          Math.max(...physicalBoxes.map((box) => box.right)) - groupBox.right,
        ),
      ).toBeLessThan(1);
    }
    const collapse = content.getAllByRole('button', {
      name: 'Collapse node',
    })[0];
    await userEvent.click(collapse);
    const expand = await content.findByRole('button', { name: 'Expand node' });
    await waitFor(() =>
      expect(
        getComputedStyle(expand.querySelector('svg')!.parentElement!).transform,
      ).toBe(
        direction === 'rtl'
          ? 'matrix(0, 1, -1, 0, 0, 0)'
          : 'matrix(0, -1, 1, 0, 0, 0)',
      ),
    );
  }
  expect(errorHandler).not.toHaveBeenCalled();
};
