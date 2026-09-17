import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { INTERACTION_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';
import { SANDBOX_ERROR_PATTERNS } from '@/__stories__/twenty-ui-gallery/constants/SANDBOX_ERROR_PATTERNS';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { expectSandboxErrors } from '@/__stories__/twenty-ui-gallery/utils/expectSandboxErrors';

export const createTooltipSandboxFailureTest =
  (runtime: 'react' | 'preact'): TwentyUiGalleryPlayFunction =>
  async ({ canvasElement }) => {
    const user = userEvent.setup();
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await expectFrontComponentMounted(canvas);
    await waitFor(() => {
      expect(canvas.getByRole('status')).toHaveAttribute('aria-busy', 'false');
    });

    const exportButton = canvas.getByRole('button', { name: 'Export records' });
    await user.hover(exportButton);

    if (runtime === 'preact') {
      await expectSandboxErrors({
        requiredErrors: [SANDBOX_ERROR_PATTERNS.ELEMENT_CLOSEST],
      });
      return;
    }

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
    await expect(
      waitFor(
        () =>
          expect(canvas.getByRole('status')).toHaveTextContent(
            'Export help: closed',
          ),
        { timeout: INTERACTION_TIMEOUT },
      ),
    ).rejects.toThrow();
    expect(errorHandler).not.toHaveBeenCalled();
    expect(canvas.getByRole('status')).toHaveTextContent('Export help: open');
    expect(
      page.getByText('Download visible records as a CSV file'),
    ).toBeVisible();
  };
