import { OnboardingPlanCard } from '@/onboarding/components/upgrade-free-trial/OnboardingPlanCard';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { RadioGroup } from 'twenty-ui/input';
import { ComponentDecorator } from 'twenty-ui/testing';

const PlanChoices = ({
  onValueChange,
}: {
  onValueChange: (value: boolean) => void;
}) => {
  const [value, setValue] = useState(false);

  return (
    <RadioGroup
      aria-label="Trial plan"
      value={value}
      onValueChange={(nextValue) => {
        setValue(nextValue);
        onValueChange(nextValue);
      }}
    >
      <OnboardingPlanCard
        title="Upgraded"
        note="Free trial with a payment method"
        value={true}
      >
        {value && <input aria-label="Payment details" />}
      </OnboardingPlanCard>
      <OnboardingPlanCard title="Basic" badge="7 days" value={false} />
    </RadioGroup>
  );
};

const meta: Meta<typeof PlanChoices> = {
  title: 'Modules/Onboarding/PlanChoices',
  component: PlanChoices,
  args: { onValueChange: fn() },
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof PlanChoices>;

export const SelectionAndPaymentDetails: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('radio', { name: 'Basic' })).toBeChecked();
    await userEvent.click(canvas.getByText('Free trial with a payment method'));
    await expect(canvas.getByRole('radio', { name: 'Upgraded' })).toBeChecked();
    await expect(args.onValueChange).toHaveBeenCalledTimes(1);
    await expect(args.onValueChange).toHaveBeenCalledWith(true);
    await userEvent.type(
      canvas.getByRole('textbox', { name: 'Payment details' }),
      'Card',
    );
    await expect(args.onValueChange).toHaveBeenCalledTimes(1);
    await userEvent.click(canvas.getByRole('radio', { name: 'Upgraded' }));
    await userEvent.keyboard('{ArrowDown}');
    await expect(canvas.getByRole('radio', { name: 'Basic' })).toBeChecked();
    await expect(args.onValueChange).toHaveBeenLastCalledWith(false);
  },
};
