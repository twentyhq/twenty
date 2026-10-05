import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { INTERACTION_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

const OVERFLOW_LABEL = 'A long workspace preference that overflows its row';

export const listItemTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const user = userEvent.setup();
  const canvas = within(canvasElement);
  const page = within(canvasElement.ownerDocument.body);
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

  const overflowingLabel = canvas.getByText(OVERFLOW_LABEL);
  await waitFor(
    () =>
      expect(overflowingLabel.scrollWidth).toBeGreaterThan(
        overflowingLabel.clientWidth,
      ),
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
      expect(page.getByRole('tooltip')).toHaveTextContent(OVERFLOW_LABEL);
      expect(page.getByRole('tooltip')).toBeVisible();
    },
    { timeout: INTERACTION_TIMEOUT },
  );

  expect(hiddenFields).toHaveFocus();
  await user.keyboard('{Escape}');
  await waitFor(() => expect(canvas.getByText('Fields: closed')).toBeVisible());
  await waitFor(() =>
    expect(page.queryByRole('tooltip')).not.toBeInTheDocument(),
  );
  await user.click(digest);
  await waitFor(() =>
    expect(canvas.getByRole('status')).toHaveTextContent('Digest: enabled'),
  );
  expect(errorHandler).not.toHaveBeenCalled();
};
