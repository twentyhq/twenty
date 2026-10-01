import { expect, userEvent, waitFor, within } from 'storybook/test';
import { THEME_LIGHT } from 'twenty-ui/theme';

import { SANDBOX_ERROR_PATTERNS } from '@/__stories__/twenty-ui-gallery/constants/SANDBOX_ERROR_PATTERNS';
import { expectSandboxErrors } from '@/__stories__/twenty-ui-gallery/utils/expectSandboxErrors';
import { withKnownHostEventErrors } from '@/__stories__/twenty-ui-gallery/utils/withKnownHostEventErrors';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const overflowingListSandboxFailureTest: TwentyUiGalleryPlayFunction =
  async ({ canvasElement }) =>
    withKnownHostEventErrors(async () => {
      const canvas = within(canvasElement);
      const page = within(canvasElement.ownerDocument.body);
      await expectFrontComponentMounted(canvas);

      const targetsTrigger = await canvas.findByRole('button', {
        name: /Show all targets$/,
      });
      const reviewersTrigger = canvas.getByRole('button', {
        name: /Show all reviewers$/,
      });

      await waitFor(() => expect(targetsTrigger).toHaveTextContent('+2'));
      await expect(reviewersTrigger).toHaveTextContent('+1');
      await expect(canvas.queryByRole('button', { name: 'Delta' })).toBeNull();

      targetsTrigger.focus();
      await userEvent.keyboard('{Enter}');

      const targetsPopup = await page.findByRole('dialog', {
        name: 'Show all targets',
      });
      const portalScope = targetsTrigger.closest<HTMLDivElement>('.light');
      await expect(canvasElement).toContainElement(portalScope);
      await expect(portalScope).toContainElement(targetsPopup);
      await waitFor(() =>
        expect(getComputedStyle(targetsPopup).color).toBe(
          THEME_LIGHT.font.color.primary,
        ),
      );
      const targets = within(targetsPopup);
      for (const name of ['Alpha', 'Bravo', 'Charlie', 'Delta']) {
        await waitFor(() =>
          expect(targets.getByRole('button', { name })).toBeVisible(),
        );
      }
      await expect(reviewersTrigger).toHaveAttribute('aria-expanded', 'false');
      await userEvent.click(targets.getByRole('button', { name: 'Delta' }));
      await waitFor(() =>
        expect(canvas.getByLabelText('Selected target')).toHaveTextContent(
          'Delta',
        ),
      );

      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(targetsPopup).not.toBeInTheDocument());
      await waitFor(() => expect(targetsTrigger).toHaveFocus());

      await userEvent.keyboard(' ');
      await page.findByRole('dialog', { name: 'Show all targets' });
      await userEvent.click(
        canvas.getByRole('button', { name: 'Outside list' }),
      );
      await waitFor(() =>
        expect(
          page.queryByRole('dialog', { name: 'Show all targets' }),
        ).toBeNull(),
      );

      await userEvent.click(canvas.getByRole('button', { name: 'Add target' }));
      await waitFor(() => expect(targetsTrigger).toHaveTextContent('+3'));
      await userEvent.click(targetsTrigger);
      const updatedTargetsPopup = await page.findByRole('dialog', {
        name: 'Show all targets',
      });
      await waitFor(() =>
        expect(
          within(updatedTargetsPopup).getByRole('button', { name: 'Echo' }),
        ).toBeVisible(),
      );
      await expect(
        within(updatedTargetsPopup).getAllByRole('button'),
      ).toHaveLength(5);
      await userEvent.keyboard('{Escape}');

      await userEvent.click(reviewersTrigger);
      const reviewersPopup = await page.findByRole('dialog', {
        name: 'Show all reviewers',
      });
      await waitFor(() =>
        expect(
          within(reviewersPopup).getByRole('button', { name: 'Taylor' }),
        ).toBeVisible(),
      );
      await expect(targetsTrigger).toHaveAttribute('aria-expanded', 'false');
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(reviewersPopup).not.toBeInTheDocument());
      await waitFor(() => expect(reviewersTrigger).toHaveFocus());
      await expectSandboxErrors({
        requiredErrors: [SANDBOX_ERROR_PATTERNS.VIEWPORT_WIDTH],
        allowedAdditionalErrors: [
          SANDBOX_ERROR_PATTERNS.NATIVE_EVENT_DEFAULT_PREVENTED,
          SANDBOX_ERROR_PATTERNS.MISSING_EVENT_CONSTRUCTOR,
        ],
      });
    });
