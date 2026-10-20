import {
  type Decorator,
  type Meta,
  type StoryObj,
} from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { ResourceCreditPackagePickerModal } from '@/settings/billing/components/internal/ResourceCreditPackagePickerModal';
import { BILLING_MODAL_IDS } from '@/settings/billing/constants/BillingModalIds';
import { isDialogOpenedComponentState } from '@/ui/layout/dialog/states/isDialogOpenedComponentState';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { RootDecorator } from '~/testing/decorators/RootDecorator';

const OpenDialogDecorator: Decorator = (Story) => {
  const dialogId = BILLING_MODAL_IDS.creditPackagePicker;

  jotaiStore.set(
    isDialogOpenedComponentState.atomFamily({ instanceId: dialogId }),
    true,
  );
  jotaiStore.set(focusStackState.atom, [
    {
      focusId: dialogId,
      componentInstance: {
        componentType: FocusComponentType.MODAL,
        componentInstanceId: dialogId,
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysWithModifiers: true,
        enableGlobalHotkeysConflictingWithKeyboard: true,
      },
    },
  ]);

  return <Story />;
};

const meta: Meta<typeof ResourceCreditPackagePickerModal> = {
  title: 'Modules/Settings/Billing/ResourceCreditPackagePickerModal',
  component: ResourceCreditPackagePickerModal,
  decorators: [OpenDialogDecorator, RootDecorator, ComponentDecorator],
  parameters: { disableHotkeyInitialization: true },
  args: {
    currentCreditAmountDisplay: '100',
    currentCreditPriceDisplay: '10',
    formatAnimatedCreditAmount: (value) => value.toFixed(0),
    formatAnimatedPriceAmount: (value) => value.toFixed(0),
    formatAnimatedRolloverLimit: (value) => value.toFixed(0),
    intervalAdjective: 'monthly',
    intervalLabel: 'month',
    isChanged: true,
    isConfirmDisabled: false,
    isUpdating: false,
    newRolloverLimit: 400,
    newRolloverLimitValue: 400,
    onCancel: fn(),
    onConfirm: fn(),
    onSliderValueChange: fn(),
    priceCount: 3,
    selectedCreditAmountValue: 200,
    selectedPriceAmountValue: 20,
    selectedPriceIndex: 1,
  },
};

export default meta;
type Story = StoryObj<typeof ResourceCreditPackagePickerModal>;

export const KeyboardSelection: Story = {
  play: async ({ canvasElement, args }) => {
    const dialog = await within(canvasElement.ownerDocument.body).findByRole(
      'dialog',
      { name: 'Choose monthly credits' },
    );
    const canvas = within(dialog);
    const slider = canvas.getByRole('slider', { name: 'Credit package' });

    await waitFor(() => expect(dialog).toBeVisible());
    await expect(dialog).toHaveAccessibleDescription(
      'Select the credit package to add to your monthly bill.',
    );
    await userEvent.click(slider);
    await userEvent.keyboard('{ArrowRight}');
    await expect(args.onSliderValueChange).toHaveBeenLastCalledWith(
      2,
      expect.objectContaining({ reason: 'keyboard' }),
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Confirm' }));
    await expect(args.onConfirm).toHaveBeenCalledOnce();
    await expect(args.onCancel).not.toHaveBeenCalled();
  },
};
