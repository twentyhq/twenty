import { expect, userEvent, waitFor, within } from 'storybook/test';

import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { SANDBOX_ERROR_PATTERNS } from '@/__stories__/twenty-ui-gallery/constants/SANDBOX_ERROR_PATTERNS';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { expectSandboxErrors } from '@/__stories__/twenty-ui-gallery/utils/expectSandboxErrors';

export const createListItemSandboxFailureTest =
  (runtime: 'react' | 'preact'): TwentyUiGalleryPlayFunction =>
  async ({ canvasElement }) => {
    const user = userEvent.setup();
    const canvas = within(canvasElement);
    await expectFrontComponentMounted(canvas);

    const digest = canvas.getByText('Weekly digest');

    await user.click(digest);
    await waitFor(() =>
      expect(canvas.getByRole('status')).toHaveTextContent('Digest: enabled'),
    );
    await user.click(digest);
    await waitFor(() =>
      expect(canvas.getByRole('status')).toHaveTextContent('Digest: disabled'),
    );
    await user.click(canvas.getByText('Disabled preference'));
    expect(canvas.getByRole('status')).toHaveTextContent('Digest: disabled');
    const hiddenFields = canvas.getByRole('button', { name: 'Hidden fields' });
    await user.click(hiddenFields);
    await waitFor(() => expect(canvas.getByText('Fields: open')).toBeVisible());
    await expectSandboxErrors({
      requiredErrors: [
        runtime === 'react'
          ? SANDBOX_ERROR_PATTERNS.COMPOSED_PATH
          : SANDBOX_ERROR_PATTERNS.ELEMENT_CONTAINS,
      ],
      allowedAdditionalErrors:
        runtime === 'preact' ? [SANDBOX_ERROR_PATTERNS.COMPOSED_PATH] : [],
    });
  };
