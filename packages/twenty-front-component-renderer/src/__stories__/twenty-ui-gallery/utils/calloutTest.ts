import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { bannerTest } from '@/__stories__/twenty-ui-gallery/utils/bannerTest';

export const calloutTest: TwentyUiGalleryPlayFunction = async (context) => {
  await bannerTest(context);
  const canvas = within(context.canvasElement);
  const callout = canvas.getByRole('region', { name: 'Import notice' });
  await waitFor(() =>
    expect(callout).toHaveAttribute('data-ref-tag', 'HTML-SECTION'),
  );
  expect(callout.tagName).toBe('SECTION');
  expect(callout).toHaveAttribute('data-composed', 'true');
  expect(callout).toHaveAttribute('data-status', 'warning');
  expect(callout).toHaveAttribute('data-variant', 'soft');
  expect(callout).toHaveAttribute('data-color', 'blue');
  expect(callout).toHaveClass('custom-callout');
  expect(callout).toHaveStyle({ marginTop: '7px' });
  expect(callout).not.toHaveAttribute('role');
  expect(callout).not.toHaveAttribute('aria-live');
  expect(canvas.getByLabelText('Import warning')).toBeVisible();
  expect(canvas.getByRole('link', { name: 'missing records' })).toHaveAttribute(
    'href',
    '#records',
  );
  const close = canvas.getByRole('button', { name: 'Request dismissal' });
  await userEvent.click(close);
  await waitFor(() =>
    expect(canvas.getByText('Dismiss requests: 1')).toBeVisible(),
  );
  await userEvent.keyboard('{Enter}');
  await waitFor(() =>
    expect(canvas.getByText('Dismiss requests: 2')).toBeVisible(),
  );
  await userEvent.keyboard(' ');
  await waitFor(() =>
    expect(canvas.getByText('Dismiss requests: 3')).toBeVisible(),
  );
  expect(canvas.getByText('Import needs review')).toBeVisible();
  await userEvent.click(canvas.getByRole('button', { name: 'Retry callout' }));
  await waitFor(() =>
    expect(canvas.getByText('Retry attempts: 1')).toBeVisible(),
  );
  expect(
    canvas.getByRole('button', { name: 'Unavailable action' }),
  ).toBeDisabled();
  const controlled = canvas.getByRole('status', { name: 'Controlled notice' });
  await waitFor(() =>
    expect(controlled).toHaveAttribute('data-ref-tag', 'HTML-ARTICLE'),
  );
  expect(controlled).toHaveAttribute('data-render-status', 'info');
  expect(controlled).toHaveAttribute('aria-live', 'polite');
  await userEvent.click(
    canvas.getByRole('button', { name: 'Dismiss controlled notice' }),
  );
  await waitFor(() =>
    expect(canvas.queryByText('Caller-owned notice')).not.toBeInTheDocument(),
  );
  await userEvent.click(canvas.getByRole('button', { name: 'Show callout' }));
  await waitFor(() =>
    expect(canvas.getByText('Caller-owned notice')).toBeVisible(),
  );
  await userEvent.click(
    canvas.getByRole('button', { name: 'Dismiss controlled notice' }),
  );
  await waitFor(() =>
    expect(canvas.queryByText('Caller-owned notice')).not.toBeInTheDocument(),
  );
  expect(canvas.getByText('Persistent notice')).toBeVisible();
  expect(
    canvas.queryByRole('button', { name: 'Close' }),
  ).not.toBeInTheDocument();
  expect(errorHandler).not.toHaveBeenCalled();
};
