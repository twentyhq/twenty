import { expect, userEvent, waitFor, within } from 'storybook/test';

import { clickElementOnceItReceivesPointer } from '@/__stories__/shared/test-utils/clickElementOnceItReceivesPointer';
import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { createDropdownOpenTest } from '@/__stories__/twenty-ui-gallery/utils/createDropdownOpenTest';

const ASSIGNEE_TRIGGER_NAME = 'Choose assignee';

const assigneeDropdownOpenTest = createDropdownOpenTest({
  triggerName: ASSIGNEE_TRIGGER_NAME,
  popupText: 'Assign person',
});

export const dropdownTest: TwentyUiGalleryPlayFunction = async (context) => {
  const canvas = within(context.canvasElement);
  const page = within(context.canvasElement.ownerDocument.body);

  await assigneeDropdownOpenTest(context);
  const trigger = canvas.getByRole('button', { name: ASSIGNEE_TRIGGER_NAME });
  await clickElementOnceItReceivesPointer(page.getByText('Assign person'));
  await clickElementOnceItReceivesPointer(
    await page.findByText('Ada Lovelace'),
  );

  await waitFor(() =>
    expect(canvas.getByRole('status')).toHaveTextContent(
      'Assignee: Ada Lovelace',
    ),
  );
  await waitFor(() =>
    expect(trigger).toHaveAttribute('aria-expanded', 'false'),
  );

  await assigneeDropdownOpenTest(context);
  await userEvent.click(trigger);
  await waitFor(() =>
    expect(trigger).toHaveAttribute('aria-expanded', 'false'),
  );
  expect(errorHandler).not.toHaveBeenCalled();
};
