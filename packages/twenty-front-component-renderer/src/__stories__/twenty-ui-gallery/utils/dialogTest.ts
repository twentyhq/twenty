import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  errorHandler,
  hostApiMocks,
} from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const dialogTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);
  await userEvent.click(canvas.getByRole('button', { name: 'Update account' }));

  await waitFor(() =>
    expect(hostApiMocks.openCommandConfirmationModal).toHaveBeenCalledWith({
      title: 'Update account',
      subtitle: 'Confirm the account changes.',
      confirmButtonText: 'Update',
    }),
  );
  expect(hostApiMocks.openCommandConfirmationModal).toHaveBeenCalledTimes(1);
  expect(canvas.getByRole('status')).toHaveTextContent(
    'Confirmation: requested',
  );
  expect(errorHandler).not.toHaveBeenCalled();
};
