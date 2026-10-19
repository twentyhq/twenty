import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { GETTING_STARTED_STEPS } from 'twenty-shared/types';
import { Button } from 'twenty-ui/primitives/input';
import { IconGoogle, IconMicrosoft, IconLock } from 'twenty-ui/icon';
import { GettingStartedPageContent } from '@/getting-started/components/GettingStartedPageContent';
import {
  StyledGettingStartedColumn,
  StyledGettingStartedRow,
  StyledGettingStartedMuted,
} from '@/getting-started/components/GettingStartedStyles';

const meta: Meta<typeof GettingStartedPageContent> = {
  title: 'Pages/GettingStarted',
  component: GettingStartedPageContent,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ height: '100vh' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    progress: {
      completedSteps: [],
      selectedStep: null,
      snoozedUntil: null,
      creditsEarned: 0,
    },
    selectedStep: 'connectMailbox',
    loading: false,
    error: false,
    saving: false,
    showCountdown: true,
    daysLeft: 3,
    trialEnd: new Date('2026-10-19T12:00:00Z'),
    select: fn(),
    onSkip: fn(),
    onRetry: fn(),
    snoozeMenu: (
      <Button variant="ghost" aria-label="Snooze Getting started">
        ⋮
      </Button>
    ),
    children: (
      <StyledGettingStartedColumn>
        <StyledGettingStartedRow>
          <IconLock size={12} />
          <StyledGettingStartedMuted>
            Teammates see who you talk to, not what you write.
          </StyledGettingStartedMuted>
        </StyledGettingStartedRow>
        <StyledGettingStartedRow>
          <Button size="sm" startIcon={<IconGoogle size={14} />}>
            Continue with Google
          </Button>
          <Button size="sm" startIcon={<IconMicrosoft size={14} />}>
            Continue with Microsoft
          </Button>
        </StyledGettingStartedRow>
      </StyledGettingStartedColumn>
    ),
  },
};
export default meta;
type Story = StoryObj<typeof GettingStartedPageContent>;
export const Trial: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('days left in your trial')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: /^Skip$/ }));
    await expect(args.onSkip).toHaveBeenCalled();
    const steps = within(
      canvas.getByRole('navigation', { name: 'Getting started steps' }),
    );
    await userEvent.click(
      steps.getByRole('button', { name: 'Invite your team' }),
    );
    await expect(args.select).toHaveBeenCalledWith('inviteTeam');
  },
};
export const FinishSetup: Story = { args: { showCountdown: false } };
export const MailboxConnected: Story = {
  args: {
    progress: {
      completedSteps: ['connectMailbox'],
      selectedStep: 'connectMailbox',
      snoozedUntil: null,
      creditsEarned: 1,
    },
    children: (
      <StyledGettingStartedColumn>
        <StyledGettingStartedRow>
          <IconGoogle size={14} />
          <span>alex@example.com</span>
          <StyledGettingStartedMuted>Syncing</StyledGettingStartedMuted>
        </StyledGettingStartedRow>
        <Button size="sm">Open people</Button>
      </StyledGettingStartedColumn>
    ),
  },
};
export const AllDone: Story = {
  args: {
    showCountdown: false,
    progress: {
      completedSteps: [...GETTING_STARTED_STEPS],
      selectedStep: 'connectMailbox',
      snoozedUntil: null,
      creditsEarned: 2,
    },
  },
};
export const Loading: Story = { args: { progress: undefined, loading: true } };
export const Error: Story = { args: { progress: undefined, error: true } };
