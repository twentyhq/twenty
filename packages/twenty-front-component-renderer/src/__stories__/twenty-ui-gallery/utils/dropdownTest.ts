import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { createOverlayOpenTest } from '@/__stories__/twenty-ui-gallery/utils/createOverlayOpenTest';

const dropdownOpenTest = createOverlayOpenTest({
  trigger: { role: 'button', name: 'Choose assignee' },
  expectedOpenStatus: null,
  popupText: 'Assign person',
});

export const dropdownTest: TwentyUiGalleryPlayFunction = async (context) => {
  const canvas = within(context.canvasElement);
  const page = within(context.canvasElement.ownerDocument.body);

  await dropdownOpenTest(context);
  await userEvent.click(
    canvas.getByRole('button', { name: 'Assign Ada and close menu' }),
  );

  const trigger = canvas.getByRole('button', { name: 'Choose assignee' });
  await waitFor(() => {
    expect(canvas.getByRole('status')).toHaveTextContent(
      'Assignee: Ada Lovelace',
    );
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  await userEvent.click(trigger);
  await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));
  expect(page.queryByText('Assign person')).not.toBeInTheDocument();
  expect(errorHandler).not.toHaveBeenCalled();
};
