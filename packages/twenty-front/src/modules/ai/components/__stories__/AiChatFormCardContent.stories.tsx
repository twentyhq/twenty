import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { FieldMetadataType } from 'twenty-shared/types';
import { ComponentDecorator } from 'twenty-ui/testing';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatFormCardContent } from '@/ai/components/AiChatFormCardContent';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { RootDecorator } from '~/testing/decorators/RootDecorator';

const AI_CHAT_FORM_CARD_STORY_WIDTH_PX = 640;

const StyledContainer = styled.div`
  padding: ${themeCssVariables.spacing[6]};
  width: ${AI_CHAT_FORM_CARD_STORY_WIDTH_PX}px;
`;

const meta = {
  title: 'Modules/AiChat/AiChatFormCardContent',
  component: AiChatFormCardContent,
  decorators: [
    (Story) => (
      <StyledContainer>
        <Story />
      </StyledContainer>
    ),
    ComponentDecorator,
    MemoryRouterDecorator,
    RootDecorator,
  ],
  args: {
    title: 'Log call with Stripe',
    fields: [
      {
        name: 'amount',
        label: 'Amount (USD)',
        type: FieldMetadataType.NUMBER,
      },
      {
        name: 'outcome',
        label: 'Outcome',
        type: FieldMetadataType.TEXT,
      },
      {
        name: 'nextStep',
        label: 'Next step',
        type: FieldMetadataType.TEXT,
        placeholder: 'What happens next?',
      },
    ],
    defaultValues: { amount: 50000, outcome: 'Positive' },
    onFieldChange: fn(),
    onError: fn(),
    onSubmit: fn(),
    onSkip: fn(),
  },
} satisfies Meta<typeof AiChatFormCardContent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Prefilled: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('2 of 3 fields prefilled')).toBeVisible();
    expect(
      await canvas.findByRole('textbox', { name: 'Outcome' }),
    ).toHaveTextContent('Positive');
    const nextStep = await canvas.findByRole('textbox', { name: 'Next step' });

    await userEvent.type(nextStep, 'Security review');
    expect(args.onFieldChange).toHaveBeenLastCalledWith({
      fieldName: 'nextStep',
      value: 'Security review',
    });

    await userEvent.click(canvas.getByRole('button', { name: 'Submit' }));
    expect(args.onSubmit).toHaveBeenCalledOnce();
  },
};

export const Skip: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(await canvas.findByRole('button', { name: 'Skip' }));
    expect(args.onSkip).toHaveBeenCalledOnce();
    expect(args.onSubmit).not.toHaveBeenCalled();
    expect(canvas.getByText('Log call with Stripe')).toBeVisible();
  },
};

export const Submitting: Story = {
  args: { isSubmitting: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByRole('button', { name: 'Submit' }),
    ).toBeDisabled();
    expect(canvas.getByRole('button', { name: 'Skip' })).toBeDisabled();
  },
};

export const WithoutPrefillOrSkip: Story = {
  args: { defaultValues: undefined, onSkip: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByRole('button', { name: 'Submit' })).toBeVisible();
    expect(
      canvas.queryByRole('button', { name: 'Skip' }),
    ).not.toBeInTheDocument();
    expect(canvas.queryByText(/fields prefilled/)).not.toBeInTheDocument();
  },
};
