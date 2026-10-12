import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

const TOOLTIP_CONTENT = 'Download visible records as a CSV file';

export const tooltipEscapeDismissalTest: TwentyUiGalleryPlayFunction = async ({
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
    expect(page.getByText(TOOLTIP_CONTENT)).toBeVisible();
  });

  await user.tab();
  expect(exportButton).toHaveFocus();
  await user.keyboard('{Escape}');

  await waitFor(() =>
    expect(canvas.getByRole('status')).toHaveTextContent('Export help: closed'),
  );
  expect(page.queryByText(TOOLTIP_CONTENT)).not.toBeInTheDocument();
  await user.tab();
  expect(canvas.getByRole('button', { name: 'Export details' })).toHaveFocus();
  await waitFor(() => {
    expect(page.getByText('Export visible records')).toBeVisible();
    expect(page.getByText('Your current filters are applied.')).toBeVisible();
  });
  await user.keyboard('{Escape}');
  await waitFor(() =>
    expect(page.queryByText('Export visible records')).not.toBeInTheDocument(),
  );
  await user.tab();
  expect(canvas.getByRole('button', { name: 'Detached export' })).toHaveFocus();
  await waitFor(() =>
    expect(page.getByText('Detached export help')).toBeVisible(),
  );
  await user.tab();
  expect(canvas.getByRole('button', { name: 'Local export' })).toHaveFocus();
  await waitFor(() =>
    expect(page.getByText('Local export help')).toBeVisible(),
  );
  await user.keyboard('{Escape}');
  await waitFor(() =>
    expect(page.queryByText('Local export help')).not.toBeInTheDocument(),
  );
  expect(errorHandler).not.toHaveBeenCalled();
};
