import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const tooltipInteractionTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const user = userEvent.setup();
  const canvas = within(canvasElement);
  const page = within(canvasElement.ownerDocument.body);
  await expectFrontComponentMounted(canvas);
  await waitFor(() => {
    expect(canvas.getByRole('status')).toHaveAttribute('aria-busy', 'false');
  });

  const exportButton = canvas.getByRole('button', { name: 'Export records' });
  await user.hover(exportButton);
  await waitFor(() => {
    expect(errorHandler).not.toHaveBeenCalled();
    expect(canvas.getByRole('status')).toHaveTextContent('Export help: open');
    expect(
      page.getByText('Download visible records as a CSV file'),
    ).toBeVisible();
  });

  await user.tab();
  expect(exportButton).toHaveFocus();
  await user.keyboard('{Escape}');
  await waitFor(() => {
    expect(errorHandler).not.toHaveBeenCalled();
    expect(canvas.getByRole('status')).toHaveTextContent('Export help: closed');
    expect(
      page.queryByText('Download visible records as a CSV file'),
    ).not.toBeInTheDocument();
  });
  await user.unhover(exportButton);
  await user.hover(canvas.getByRole('button', { name: 'Export details' }));
  await waitFor(() => {
    expect(errorHandler).not.toHaveBeenCalled();
    expect(page.getByText('Export visible records')).toBeVisible();
    expect(page.getByText('Your current filters are applied.')).toBeVisible();
  });
};
