import { expect, userEvent, waitFor, within } from 'storybook/test';

import { SANDBOX_ERROR_PATTERNS } from '@/__stories__/twenty-ui-gallery/constants/SANDBOX_ERROR_PATTERNS';
import { expectSandboxErrors } from '@/__stories__/twenty-ui-gallery/utils/expectSandboxErrors';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const expandableListEventIsolationFailureTest: TwentyUiGalleryPlayFunction =
  async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await expectFrontComponentMounted(canvas);

    const trigger = await canvas.findByRole('button', {
      name: /Show all targets$/,
    });
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    const popup = await page.findByRole('dialog', { name: 'Show all targets' });
    const lastTarget = within(popup).getByRole('button', { name: 'Delta' });
    await waitFor(() => expect(lastTarget).toBeVisible());
    await waitFor(() =>
      expect(
        Number(canvas.getByLabelText('Host activations').textContent),
      ).toBeGreaterThan(0),
    );
    const hostActivationsBeforeSelection = Number(
      canvas.getByLabelText('Host activations').textContent,
    );

    await userEvent.click(lastTarget);
    await waitFor(() =>
      expect(canvas.getByLabelText('Selected target')).toHaveTextContent(
        'Delta',
      ),
    );
    await waitFor(() =>
      expect(
        Number(canvas.getByLabelText('Host activations').textContent),
      ).toBe(hostActivationsBeforeSelection),
    );
    await expectSandboxErrors({
      requiredErrors: [SANDBOX_ERROR_PATTERNS.NATIVE_EVENT_DEFAULT_PREVENTED],
      allowedAdditionalErrors: [
        SANDBOX_ERROR_PATTERNS.VIEWPORT_WIDTH,
        SANDBOX_ERROR_PATTERNS.MISSING_EVENT_CONSTRUCTOR,
      ],
    });
  };
