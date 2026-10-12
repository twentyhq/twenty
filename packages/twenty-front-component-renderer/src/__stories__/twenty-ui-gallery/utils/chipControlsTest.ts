import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { INTERACTION_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { galleryRenderTest } from '@/__stories__/twenty-ui-gallery/utils/galleryRenderTests';

const OVERFLOW_LABEL = 'A long account name that truncates inside a chip';
const TOOLTIP_CONTENT = 'Caller supplied details\nFull account name';

export const chipControlsTest: TwentyUiGalleryPlayFunction = async (
  context,
) => {
  await galleryRenderTest(context);
  const user = userEvent.setup();
  const canvas = within(context.canvasElement);
  const page = within(context.canvasElement.ownerDocument.body);

  const staticChip = canvas.getByTestId('static-chip');
  expect(staticChip.tagName).toBe('DIV');
  expect(staticChip).toHaveAttribute('data-ref-target', 'chip-div');
  expect(staticChip).not.toHaveAttribute('role');
  expect(staticChip).not.toHaveAttribute('tabindex');
  await user.click(staticChip);
  await waitFor(() =>
    expect(canvas.getByLabelText('Native chip clicks')).toHaveTextContent('1'),
  );
  expect(staticChip.tagName).toBe('DIV');
  expect(canvas.getByTestId('empty-chip').textContent).toBe('');
  expect(canvas.queryByText('Untitled')).not.toBeInTheDocument();
  expect(canvas.getByText('Unnamed record')).toBeVisible();
  expect(canvas.getByText('Start slot')).toBeVisible();
  expect(canvas.getByText('End slot')).toBeVisible();
  expect(canvas.getByText('Node content').tagName).toBe('STRONG');

  const button = canvas.getByRole('button', { name: 'Open chip' });
  expect(button.tagName).toBe('BUTTON');
  expect(button).toHaveAttribute('type', 'button');
  expect(button).toHaveAttribute('data-ref-target', 'chip-button');
  await user.click(button);
  button.focus();
  await user.keyboard('{Enter} ');
  await waitFor(() =>
    expect(canvas.getByLabelText('Activations')).toHaveTextContent('3'),
  );
  expect(button).toHaveFocus();
  const disabledButton = canvas.getByRole('button', { name: 'Disabled chip' });
  expect(disabledButton).toBeDisabled();
  await user.click(disabledButton);
  expect(canvas.getByLabelText('Activations')).toHaveTextContent('3');

  const iconOnlyButton = canvas.getByRole('button', { name: 'Star record' });
  expect(iconOnlyButton.textContent).toBe('');
  button.focus();
  await user.tab();
  expect(iconOnlyButton).toHaveFocus();
  await user.click(iconOnlyButton);
  await waitFor(() =>
    expect(canvas.getByLabelText('Activations')).toHaveTextContent('4'),
  );

  const link = canvas.getByRole('link', { name: 'Chip documentation' });
  expect(link.tagName).toBe('A');
  expect(link).toHaveAttribute('href', '#chip-documentation');
  expect(link).toHaveAttribute('data-composed', 'chip-link');
  expect(link).toHaveAttribute('data-ref-target', 'chip-link');
  expect(link.querySelector('a')).toBeNull();
  link.focus();
  expect(link).toHaveFocus();
  await waitFor(() =>
    expect(canvas.getByLabelText('Chip link focuses')).toHaveTextContent('1'),
  );
  expect(canvas.getByLabelText('Plain chip URL').querySelector('a')).toBeNull();
  expect(
    canvas.getByRole('link', { name: 'Caller supplied link' }),
  ).toHaveAttribute('href', '#chip-content');
  expect(
    getComputedStyle(canvas.getByText('Untruncated chip content')).textOverflow,
  ).not.toBe('ellipsis');

  const overflowingLabel = canvas.getByText(OVERFLOW_LABEL);
  await waitFor(
    () => {
      expect(getComputedStyle(overflowingLabel).textOverflow).toBe('ellipsis');
      expect(overflowingLabel.scrollWidth).toBeGreaterThan(
        overflowingLabel.clientWidth,
      );
    },
    { timeout: INTERACTION_TIMEOUT },
  );
  await waitFor(
    async () => {
      await user.unhover(overflowingLabel);
      await user.hover(overflowingLabel);
      expect(overflowingLabel).toHaveAttribute('data-content-overflowing');
    },
    { timeout: INTERACTION_TIMEOUT },
  );
  await user.unhover(overflowingLabel);
  await user.hover(overflowingLabel);
  await waitFor(
    () => {
      const tooltip = page.getByRole('tooltip');
      expect(tooltip.textContent).toBe(TOOLTIP_CONTENT);
      expect(tooltip).toBeVisible();
      expect(getComputedStyle(tooltip).whiteSpace).toBe('pre-wrap');
    },
    { timeout: INTERACTION_TIMEOUT },
  );
  button.focus();
  await user.keyboard('{Escape}');
  await waitFor(() =>
    expect(canvas.getByLabelText('Last chip key')).toHaveTextContent('Escape'),
  );
  await waitFor(() =>
    expect(page.queryByRole('tooltip')).not.toBeInTheDocument(),
  );
  expect(errorHandler).not.toHaveBeenCalled();
};
