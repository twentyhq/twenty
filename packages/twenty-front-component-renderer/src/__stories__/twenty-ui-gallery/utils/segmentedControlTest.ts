import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { expect, userEvent, waitFor, within } from 'storybook/test';

export const segmentedControlTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);
  const group = canvas.getByRole('radiogroup', { name: 'Record view' });
  const list = within(group).getByRole('radio', { name: 'List view' });
  const board = within(group).getByRole('radio', { name: 'Board view' });
  const grid = within(group).getByRole('radio', { name: 'Grid view' });

  expect(list).toBeChecked();
  expect(board).toHaveAttribute('aria-disabled', 'true');
  expect(canvas.queryByRole('tablist')).not.toBeInTheDocument();
  expect(canvas.queryByRole('tabpanel')).not.toBeInTheDocument();
  expect(list).not.toHaveAttribute('aria-controls');
  await userEvent.click(board);
  expect(board).not.toBeChecked();
  expect(canvas.getByText('View: list; Changes: 0')).toBeVisible();

  await userEvent.click(list);
  await userEvent.keyboard('{ArrowRight}');
  await waitFor(() =>
    expect(canvas.getByText('View: grid; Changes: 1')).toBeVisible(),
  );
  expect(grid).toHaveFocus();
  expect(grid).toBeChecked();
  expect(list).not.toBeChecked();
  expect(board).not.toBeChecked();

  await userEvent.keyboard('{ArrowLeft}');
  await waitFor(() =>
    expect(canvas.getByText('View: list; Changes: 2')).toBeVisible(),
  );
  expect(list).toHaveFocus();
  expect(list).toBeChecked();
  expect(grid).not.toBeChecked();
  expect(errorHandler).not.toHaveBeenCalled();
};
