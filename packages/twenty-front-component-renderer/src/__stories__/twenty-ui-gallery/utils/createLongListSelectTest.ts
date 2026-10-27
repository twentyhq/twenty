import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectElementToReceivePointer } from '@/__stories__/shared/test-utils/matchers/expectElementToReceivePointer';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { INTERACTION_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

const POPUP_POSITION_ROUNDING_TOLERANCE = 1;

export const createLongListSelectTest =
  (dismissal: 'selection' | 'host'): TwentyUiGalleryPlayFunction =>
  async ({ canvasElement }) => {
    const user = userEvent.setup();
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await expectFrontComponentMounted(canvas);
    const trigger = canvas.getByRole('combobox', { name: 'Engineer' });

    const openSelect = async () => {
      await user.click(trigger);
      await waitFor(
        () => {
          expect(trigger).toHaveAttribute('aria-expanded', 'true');
          const popup = page.getByRole('listbox');
          const selectedOption = page.getByRole('option', { selected: true });
          expect(popup).toBeVisible();
          const popupRectangle = popup.getBoundingClientRect();
          const triggerRectangle = trigger.getBoundingClientRect();
          const selectedOptionRectangle =
            selectedOption.getBoundingClientRect();
          expect(popupRectangle.height).toBeGreaterThanOrEqual(
            selectedOptionRectangle.height,
          );
          expect(popupRectangle.width).toBeGreaterThanOrEqual(
            triggerRectangle.width - POPUP_POSITION_ROUNDING_TOLERANCE,
          );
          expect(popupRectangle.left).toBeLessThan(triggerRectangle.right);
          expect(popupRectangle.right).toBeGreaterThan(triggerRectangle.left);
          expectElementToReceivePointer(selectedOption);
        },
        { timeout: INTERACTION_TIMEOUT },
      );
    };

    const expectSelectClosed = async () => {
      await waitFor(
        () => {
          expect(trigger).toHaveAttribute('aria-expanded', 'false');
          expect(page.queryByRole('listbox')).not.toBeInTheDocument();
        },
        { timeout: INTERACTION_TIMEOUT },
      );
    };

    if (dismissal === 'selection') {
      await openSelect();
      await user.click(trigger);
      await expectSelectClosed();
      await openSelect();
      await user.click(trigger);
      await expectSelectClosed();

      for (const option of [
        { label: 'Engineer 4', value: 'engineer-4' },
        { label: 'Engineer 6', value: 'engineer-6' },
        { label: 'Engineer 5', value: 'engineer-5' },
      ]) {
        await openSelect();
        const optionElement = page.getByRole('option', { name: option.label });
        expectElementToReceivePointer(optionElement);
        await user.click(optionElement);
        await expectSelectClosed();
        expect(trigger).toHaveTextContent(option.label);
        expect(
          canvas.getByRole('status', { name: 'Engineer selection' }),
        ).toHaveTextContent(`Engineer: ${option.value}`);
      }

      expect(errorHandler).not.toHaveBeenCalled();
      return;
    }

    const hostAction = canvas.getByRole('button', { name: 'Host action' });

    for (const actionCount of [1, 2]) {
      await openSelect();
      expectElementToReceivePointer(hostAction);
      await user.click(hostAction);
      await expectSelectClosed();
      expect(trigger).toHaveTextContent('Engineer 5');
      expect(
        canvas.getByRole('status', { name: 'Host actions' }),
      ).toHaveTextContent(`Host actions: ${actionCount}`);
    }

    expect(errorHandler).not.toHaveBeenCalled();
  };
