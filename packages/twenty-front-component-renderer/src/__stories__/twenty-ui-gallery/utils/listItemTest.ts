import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { INTERACTION_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { listItemButtonTest } from '@/__stories__/twenty-ui-gallery/utils/listItemButtonTest';
import { listItemOwnerTest } from '@/__stories__/twenty-ui-gallery/utils/listItemOwnerTest';
import { listItemPopupOwnerTest } from '@/__stories__/twenty-ui-gallery/utils/listItemPopupOwnerTest';
import { listItemPresentationTest } from '@/__stories__/twenty-ui-gallery/utils/listItemPresentationTest';

const OVERFLOW_LABEL = 'A long workspace preference that overflows its row';

export const listItemTest: TwentyUiGalleryPlayFunction = async (context) => {
  const { canvasElement } = context;
  const user = userEvent.setup();
  const canvas = within(canvasElement);
  const page = within(canvasElement.ownerDocument.body);
  await expectFrontComponentMounted(canvas);
  await listItemButtonTest(context);
  await listItemOwnerTest(context);
  await listItemPresentationTest(context);
  await listItemPopupOwnerTest(context);

  const digest = canvas.getByRole('button', {
    name: /^Weekly digest\s*Workspace preference$/,
  });

  await user.click(digest);
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

  expect(digest).toHaveFocus();
  await user.keyboard('{Escape}');
  await waitFor(() =>
    expect(page.queryByRole('tooltip')).not.toBeInTheDocument(),
  );
  await user.click(digest);
  await waitFor(() =>
    expect(canvas.getByLabelText('Digest activations')).toHaveTextContent('5'),
  );
  expect(errorHandler).not.toHaveBeenCalled();
};
