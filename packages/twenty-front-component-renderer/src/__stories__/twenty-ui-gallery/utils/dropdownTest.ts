import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectElementToReceivePointer } from '@/__stories__/shared/test-utils/matchers/expectElementToReceivePointer';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const dropdownTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);

  const trigger = canvas.getByRole('button', { name: 'Choose assignee' });
  await userEvent.click(trigger);
  const assignPersonItem = await canvas.findByText('Assign person');
  await waitFor(() => expectElementToReceivePointer(assignPersonItem));
  await userEvent.click(assignPersonItem);
  const adaLovelaceItem = await canvas.findByText('Ada Lovelace');
  await waitFor(() => expectElementToReceivePointer(adaLovelaceItem));
  await userEvent.click(adaLovelaceItem);

  await waitFor(() =>
    expect(canvas.getByRole('status')).toHaveTextContent(
      'Assignee: Ada Lovelace',
    ),
  );
  await waitFor(() =>
    expect(trigger).toHaveAttribute('aria-expanded', 'false'),
  );

  await userEvent.click(trigger);
  await waitFor(() => {
    const reopenedAssignPersonItem = canvas.getByText('Assign person');

    expect(reopenedAssignPersonItem).toBeVisible();
    expectElementToReceivePointer(reopenedAssignPersonItem);
  });
  await userEvent.click(trigger);
  await waitFor(() =>
    expect(trigger).toHaveAttribute('aria-expanded', 'false'),
  );
  expect(errorHandler).not.toHaveBeenCalled();
};
