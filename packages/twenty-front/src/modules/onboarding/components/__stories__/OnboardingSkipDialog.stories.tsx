import { type Meta, type StoryObj } from '@storybook/react-vite';
import { type ComponentProps } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { IconGoogle, IconMicrosoft } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { ComponentDecorator } from 'twenty-ui/testing';

import { OnboardingSkipDialog } from '@/onboarding/components/OnboardingSkipDialog';
import { OnboardingSkipDialogAvatars } from '@/onboarding/components/OnboardingSkipDialogAvatars';
import { ONBOARDING_NETWORK_PREVIEW_PEOPLE } from '@/onboarding/constants/OnboardingNetworkPreviewPeople';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { RootDecorator } from '~/testing/decorators/RootDecorator';

const DIALOG_ID = 'onboarding-skip-dialog-story';

type OnboardingSkipDialogExampleProps = Omit<
  ComponentProps<typeof OnboardingSkipDialog>,
  'dialogId'
>;

const OnboardingSkipDialogExample = (
  props: OnboardingSkipDialogExampleProps,
) => {
  const { openDialog } = useDialog();

  return (
    <>
      <Button onClick={() => openDialog(DIALOG_ID)}>Open dialog</Button>
      <OnboardingSkipDialog {...props} dialogId={DIALOG_ID} />
    </>
  );
};

const openSkipDialog = async (canvasElement: HTMLElement) => {
  await userEvent.click(
    within(canvasElement).getByRole('button', { name: 'Open dialog' }),
  );

  return within(canvasElement.ownerDocument.body).findByRole('dialog', {
    name: 'Start with your whole network',
  });
};

const meta: Meta<typeof OnboardingSkipDialogExample> = {
  title: 'Modules/Onboarding/OnboardingSkipDialog',
  component: OnboardingSkipDialogExample,
  decorators: [RootDecorator, ComponentDecorator],
  args: {
    visual: (
      <OnboardingSkipDialogAvatars
        avatars={ONBOARDING_NETWORK_PREVIEW_PEOPLE.map((person) => ({
          id: person.id,
          name: '',
          src: person.avatarUrl,
          shape: 'circle',
        }))}
      />
    ),
    title: 'Start with your whole network',
    description:
      'Twenty adds the people you email and meet, and keeps them up to date without manual data entry.',
    actions: [
      {
        label: 'Continue with Microsoft',
        Icon: IconMicrosoft,
        onClick: fn(),
      },
      {
        label: 'Continue with Google',
        Icon: IconGoogle,
        onClick: fn(),
      },
    ],
    creditsReward: 2,
    onSkip: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof OnboardingSkipDialogExample>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const dialog = await openSkipDialog(canvasElement);

    await expect(
      within(dialog).getByRole('button', {
        name: 'Continue with Google, earn 2 free credits',
      }),
    ).toHaveTextContent('+2');
  },
};

export const WithoutCreditsReward: Story = {
  args: { creditsReward: 0 },
  play: async ({ canvasElement }) => {
    const dialog = await openSkipDialog(canvasElement);

    await expect(
      within(dialog).getByRole('button', { name: 'Continue with Google' }),
    ).toHaveTextContent(/^Continue with Google$/);
  },
};

export const SkipAnyway: Story = {
  play: async ({ canvasElement, args }) => {
    const dialog = await openSkipDialog(canvasElement);

    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Skip anyway' }),
    );

    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await expect(args.onSkip).toHaveBeenCalledTimes(1);
  },
};

export const PerItemCreditsReward: Story = {
  args: {
    actions: [{ label: 'Add teammates', onClick: fn() }],
    creditsReward: 0.5,
    isRewardPerItem: true,
  },
  play: async ({ canvasElement }) => {
    const dialog = await openSkipDialog(canvasElement);

    await expect(
      within(dialog).getByRole('button', {
        name: 'Add teammates, earn 0.5 free credits each',
      }),
    ).toHaveTextContent('+0.5 each');
  },
};
