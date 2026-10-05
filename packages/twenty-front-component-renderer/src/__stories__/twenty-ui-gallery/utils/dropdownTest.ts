import { expect, userEvent, waitFor, within } from 'storybook/test';

import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { createOverlayOpenTest } from '@/__stories__/twenty-ui-gallery/utils/createOverlayOpenTest';
import { expectTriggerClosesAndReopensOverlay } from '@/__stories__/twenty-ui-gallery/utils/expectTriggerClosesAndReopensOverlay';

const DROPDOWN_TRIGGER_NAME = 'Choose assignee';

const dropdownOpenTest = createOverlayOpenTest({
  trigger: { role: 'button', name: DROPDOWN_TRIGGER_NAME },
  popupText: 'Assign person',
});

export const dropdownTest: TwentyUiGalleryPlayFunction = async (context) => {
  const canvas = within(context.canvasElement);

  await dropdownOpenTest(context);
  const trigger = canvas.getByRole('button', { name: DROPDOWN_TRIGGER_NAME });
  await userEvent.click(
    canvas.getByRole('button', { name: 'Assign Ada and close menu' }),
  );

  await waitFor(() => {
    expect(canvas.getByRole('status')).toHaveTextContent(
      'Assignee: Ada Lovelace',
    );
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  await dropdownOpenTest(context);
  await expectTriggerClosesAndReopensOverlay(trigger);
};
