import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { galleryRenderTest } from '@/__stories__/twenty-ui-gallery/utils/galleryRenderTests';

export const statusControlsTest: TwentyUiGalleryPlayFunction = async (
  context,
) => {
  await galleryRenderTest(context);
  const canvas = within(context.canvasElement);
  const defaultStatus = canvas.getByTitle('Default status with handler');

  expect(defaultStatus.tagName).toBe('SPAN');
  expect(defaultStatus).toHaveAttribute('data-ref-target', 'default-status');
  expect(defaultStatus).not.toHaveAttribute('role');
  expect(defaultStatus).not.toHaveAttribute('tabindex');
  expect(defaultStatus).not.toHaveAttribute('aria-live');
  expect(defaultStatus).not.toHaveAttribute('data-interactive');
  await userEvent.click(defaultStatus);
  await waitFor(() =>
    expect(
      canvas.getByLabelText('Default status activations'),
    ).toHaveTextContent('1'),
  );

  const button = canvas.getByRole('button', { name: 'Open status' });

  expect(button.tagName).toBe('BUTTON');
  expect(button).toHaveAttribute('data-ref-target', 'status-button');
  await userEvent.click(button);
  button.focus();
  await userEvent.keyboard('{Enter} ');
  await waitFor(() =>
    expect(canvas.getByLabelText('Activations')).toHaveTextContent('3'),
  );
  expect(button).toHaveFocus();

  const disabledButton = canvas.getByRole('button', {
    name: 'Disabled status',
  });

  expect(disabledButton).toBeDisabled();
  await userEvent.click(disabledButton);
  expect(canvas.getByLabelText('Activations')).toHaveTextContent('3');

  const link = canvas.getByRole('link', { name: 'Status documentation' });

  expect(link.tagName).toBe('A');
  expect(link).toHaveAttribute('href', '#status-documentation');
  expect(link).toHaveAttribute('target', '_self');
  expect(link).toHaveAttribute('data-ref-target', 'status-link');
  expect(link).toHaveAttribute('data-render-loading', 'false');
  button.focus();
  await userEvent.tab();
  expect(link).toHaveFocus();
  await userEvent.click(link);
  link.focus();
  await userEvent.keyboard('{Enter}');
  await waitFor(() =>
    expect(canvas.getByLabelText('Status link activations')).toHaveTextContent(
      '2',
    ),
  );
  expect(link).toHaveFocus();

  const nodeLink = canvas.getByRole('link', {
    name: 'Intentional status link',
  });

  expect(nodeLink).toHaveAttribute('href', '#status-records');
  expect(nodeLink.parentElement?.parentElement?.tagName).toBe('SPAN');

  const loadingStatus = canvas.getByTitle('Loading status indicator');

  expect(loadingStatus.tagName).toBe('SPAN');
  expect(loadingStatus).toHaveAttribute('aria-busy', 'true');
  expect(loadingStatus).not.toHaveAttribute('role');
  expect(loadingStatus).not.toHaveAttribute('aria-live');
  expect(loadingStatus.querySelector('[aria-hidden="true"]')).toBeVisible();
  expect(canvas.getByText('Loading status')).toBeVisible();
  expect(
    canvas.getByText('Caller-owned busy state').parentElement,
  ).toHaveAttribute('aria-busy', 'false');
  await userEvent.click(
    canvas.getByRole('button', { name: 'Toggle status loading' }),
  );
  await waitFor(() => {
    expect(loadingStatus).not.toHaveAttribute('aria-busy');
    expect(loadingStatus.querySelector('[aria-hidden="true"]')).toBeNull();
  });
  expect(canvas.getByText('Loading status')).toBeVisible();
  await userEvent.click(
    canvas.getByRole('button', { name: 'Toggle status loading' }),
  );
  await waitFor(() =>
    expect(loadingStatus).toHaveAttribute('aria-busy', 'true'),
  );
  expect(errorHandler).not.toHaveBeenCalled();
};
