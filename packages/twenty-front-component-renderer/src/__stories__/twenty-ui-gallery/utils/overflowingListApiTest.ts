import { expect, userEvent, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { createWaitForFrontComponentInteraction } from '@/__stories__/shared/test-utils/createWaitForFrontComponentInteraction';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const overflowingListApiTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  const page = within(canvasElement.ownerDocument.body);
  const waitForInteraction = createWaitForFrontComponentInteraction(
    canvasElement.ownerDocument.body,
  );
  await expectFrontComponentMounted(canvas);

  const initialPopup = await page.findByRole('dialog', {
    name: 'Initially open overflow',
  });
  const initiallyHiddenItem = await within(initialPopup).findByRole('button', {
    name: 'Initially hidden item',
  });
  await waitForInteraction(() => {
    expect(initiallyHiddenItem).toBeVisible();
    expect(initiallyHiddenItem).toHaveFocus();
  });
  await userEvent.keyboard('{Escape}');
  await waitForInteraction(() => expect(initialPopup).not.toBeInTheDocument());

  const trigger = canvas.getByRole('button', {
    name: 'Custom overflow trigger',
  });
  await expect(trigger).toHaveTextContent('+2');
  await expect(trigger).toHaveAttribute('data-native-trigger', 'custom');
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await userEvent.click(trigger);

  const popup = await page.findByRole('dialog', {
    name: 'Controlled overflow items',
  });
  await expect(popup.tagName).toBe('SECTION');
  await waitForInteraction(() =>
    expect(canvas.getByLabelText('Overflow open changes')).toHaveTextContent(
      'true:trigger-press:click',
    ),
  );
  await expect(
    canvas.getByLabelText('Overflow trigger click'),
  ).toHaveTextContent('click');
  await expect(
    canvas.getByLabelText('Overflow parent activations'),
  ).toHaveTextContent('1');
  await waitForInteraction(() => {
    expect(popup).toBeVisible();
    expect(within(popup).getAllByRole('button')).toHaveLength(3);
  });
  const controlledItem = within(popup).getByRole('button', {
    name: 'Controlled Charlie',
  });
  await userEvent.click(controlledItem);
  await waitForInteraction(() => {
    expect(canvas.getByLabelText('Overflow popup click')).toHaveTextContent(
      'click:Controlled Charlie',
    );
    expect(controlledItem).toHaveFocus();
  });

  await userEvent.keyboard('{Escape}');
  await waitForInteraction(() =>
    expect(canvas.getByLabelText('Overflow open changes')).toHaveTextContent(
      'false:escape-key:keydown',
    ),
  );
  await waitForInteraction(async () => {
    await expect(popup).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(within(popup).getAllByRole('button')).toHaveLength(3);

    for (const targetName of [
      'Controlled Alpha',
      'Controlled Bravo',
      'Controlled Charlie',
    ]) {
      await expect(
        within(popup).getByRole('button', { name: targetName }),
      ).toBeVisible();
    }
  });
  await expect(
    canvas.getByLabelText('Overflow native targets'),
  ).toHaveTextContent('controlled,custom,section');

  await userEvent.click(
    canvas.getByRole('button', { name: 'Close controlled overflow' }),
  );
  await waitForInteraction(() => expect(popup).not.toBeInTheDocument());
  await userEvent.click(
    canvas.getByRole('button', { name: 'Allow overflow Escape' }),
  );
  await userEvent.click(
    canvas.getByRole('button', { name: 'Open controlled overflow' }),
  );
  const externallyOpenedPopup = await page.findByRole('dialog', {
    name: 'Controlled overflow items',
  });
  await waitForInteraction(() => expect(externallyOpenedPopup).toBeVisible());
  const externallyOpenedItem = within(externallyOpenedPopup).getByRole(
    'button',
    { name: 'Controlled Bravo' },
  );
  await userEvent.click(externallyOpenedItem);
  await waitForInteraction(() => expect(externallyOpenedItem).toHaveFocus());
  await userEvent.keyboard('{Escape}');
  await waitForInteraction(() =>
    expect(externallyOpenedPopup).not.toBeInTheDocument(),
  );
  await waitForInteraction(() => expect(trigger).toHaveFocus());
  await userEvent.click(
    canvas.getByRole('button', { name: 'Open deferred overflow' }),
  );
  const deferredPopup = await page.findByRole('dialog', {
    name: 'Deferred overflow items',
  });
  await waitForInteraction(() => {
    expect(deferredPopup).toBeVisible();
    expect(within(deferredPopup).getAllByRole('button')).toHaveLength(3);
  });
  await userEvent.click(
    within(deferredPopup).getByRole('button', {
      name: 'Close deferred overflow',
    }),
  );
  await waitForInteraction(() => {
    expect(
      canvas.getByLabelText('Deferred overflow open changes'),
    ).toHaveTextContent('false:imperative-action');
    expect(deferredPopup).toHaveAttribute('data-closed');
    expect(
      canvas.getByLabelText('Deferred overflow popup mounted'),
    ).toHaveTextContent(/^mounted$/);
  });
  await expect(deferredPopup.isConnected).toBe(true);
  await userEvent.click(
    canvas.getByRole('button', { name: 'Complete deferred exit' }),
  );
  await waitForInteraction(() => {
    expect(deferredPopup.isConnected).toBe(false);
    expect(
      canvas.getByLabelText('Deferred overflow popup mounted'),
    ).toHaveTextContent(/^unmounted$/);
  });
  await userEvent.click(
    canvas.getByRole('button', { name: 'Open deferred overflow' }),
  );
  const reopenedDeferredPopup = await page.findByRole('dialog', {
    name: 'Deferred overflow items',
  });
  await waitForInteraction(() => {
    expect(reopenedDeferredPopup).toBeVisible();
    expect(within(reopenedDeferredPopup).getAllByRole('button')).toHaveLength(
      3,
    );
  });
  expect(errorHandler).not.toHaveBeenCalled();
};
