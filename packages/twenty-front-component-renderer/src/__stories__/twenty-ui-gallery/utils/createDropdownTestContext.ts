import { expect, userEvent, waitFor, within } from 'storybook/test';

import { expectElementToReceivePointer } from '@/__stories__/shared/test-utils/matchers/expectElementToReceivePointer';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { INTERACTION_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';

export const createDropdownTestContext = async (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  const page = within(canvasElement.ownerDocument.body);
  await expectFrontComponentMounted(canvas);
  const trigger = canvas.getByRole('button', { name: 'Open actions' });

  const openMenu = async () => {
    await userEvent.click(trigger);
    await waitFor(
      () => {
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
        expect(
          page.getByRole('menu', { name: 'Record actions' }),
        ).toBeVisible();
        expectElementToReceivePointer(
          page.getByRole('menuitem', { name: 'Select record' }),
        );
      },
      { timeout: INTERACTION_TIMEOUT },
    );
  };

  const expectMenuClosed = async () => {
    await waitFor(
      () => {
        expect(trigger).toHaveAttribute('aria-expanded', 'false');
        expect(
          page.queryByRole('menu', { name: 'Record actions' }),
        ).not.toBeInTheDocument();
      },
      { timeout: INTERACTION_TIMEOUT },
    );
  };

  return { canvas, page, trigger, openMenu, expectMenuClosed };
};
