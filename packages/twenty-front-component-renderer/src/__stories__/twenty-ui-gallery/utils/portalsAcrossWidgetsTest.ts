import { expect, userEvent, waitFor, within } from 'storybook/test';

import { clickElementOnceItReceivesPointer } from '@/__stories__/shared/test-utils/clickElementOnceItReceivesPointer';
import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { MOUNT_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const portalsAcrossWidgetsTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  const page = within(canvasElement.ownerDocument.body);
  await waitFor(
    () =>
      expect(canvas.getAllByTestId('front-component-mounted')).toHaveLength(2),
    { timeout: MOUNT_TIMEOUT },
  );
  const firstWidget = within(
    canvas.getByRole('group', { name: 'First widget' }),
  );
  const secondWidget = within(
    canvas.getByRole('group', { name: 'Second widget' }),
  );

  await userEvent.click(
    firstWidget.getByRole('button', { name: 'Toggle popup' }),
  );
  await userEvent.click(
    secondWidget.getByRole('button', { name: 'Toggle popup' }),
  );
  await waitFor(() =>
    expect(page.getAllByRole('button', { name: 'Portal action' })).toHaveLength(
      2,
    ),
  );

  await userEvent.click(
    firstWidget.getByRole('button', { name: 'Toggle popup' }),
  );
  await waitFor(() =>
    expect(page.getAllByRole('button', { name: 'Portal action' })).toHaveLength(
      1,
    ),
  );

  await clickElementOnceItReceivesPointer(
    page.getByRole('button', { name: 'Portal action' }),
  );
  await waitFor(() =>
    expect(
      secondWidget.getByRole('status', { name: 'Portal actions' }),
    ).toHaveTextContent('Portal actions: 1'),
  );
  expect(
    firstWidget.getByRole('status', { name: 'Portal actions' }),
  ).toHaveTextContent('Portal actions: 0');
  expect(errorHandler).not.toHaveBeenCalled();
};
