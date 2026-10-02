import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { SANDBOX_ROUND_TRIP_SETTLE_DELAY } from '@/__stories__/shared/test-utils/timeouts';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

const TOOLTIP_CONTENT = 'Download visible records as a CSV file';

const openTooltipThenPressEscape = async (canvasElement: HTMLElement) => {
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

  return { canvas, page };
};

export const tooltipEscapeDismissalTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const { canvas, page } = await openTooltipThenPressEscape(canvasElement);

  await waitFor(() =>
    expect(canvas.getByRole('status')).toHaveTextContent('Export help: closed'),
  );
  expect(page.queryByText(TOOLTIP_CONTENT)).not.toBeInTheDocument();
  expect(errorHandler).not.toHaveBeenCalled();
};

// React drops the handlers Base UI adds through cloneElement, so the Escape
// key never reaches the sandbox and the tooltip stays open.
export const tooltipEscapeIgnoredTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const { canvas, page } = await openTooltipThenPressEscape(canvasElement);

  await new Promise((resolve) =>
    setTimeout(resolve, SANDBOX_ROUND_TRIP_SETTLE_DELAY),
  );
  expect(errorHandler).not.toHaveBeenCalled();
  expect(canvas.getByRole('status')).toHaveTextContent('Export help: open');
  expect(page.getByText(TOOLTIP_CONTENT)).toBeVisible();
};
