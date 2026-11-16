import { EmailsCardContent } from '@/activities/emails/components/EmailsCardContent';
import { timelineThreadChannelFilterFamilyState } from '@/activities/emails/states/timelineThreadChannelFilterFamilyState';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { StandardObjectNameSingular } from 'twenty-shared/types';
import { ComponentDecorator } from 'twenty-ui/testing';
import { PageLayoutType } from '~/generated-metadata/graphql';
import { MessageChannelType } from '~/generated/graphql';

const TARGET_RECORD_ID = 'story-company';

const getTimelineThreadChannelFilter = () =>
  jotaiStore.get(
    timelineThreadChannelFilterFamilyState.atomFamily(TARGET_RECORD_ID),
  );

const onRetry = fn();

const meta: Meta<typeof EmailsCardContent> = {
  title: 'Modules/Activities/Emails/EmailsCardContent',
  component: EmailsCardContent,
  decorators: [
    (Story) => (
      <LayoutRenderingProvider
        value={{
          layoutType: PageLayoutType.RECORD_PAGE,
          targetRecordIdentifier: {
            id: TARGET_RECORD_ID,
            targetObjectNameSingular: StandardObjectNameSingular.Company,
          },
        }}
      >
        <Story />
      </LayoutRenderingProvider>
    ),
    ComponentDecorator,
  ],
  parameters: { container: { width: 360 } },
  args: {
    firstQueryLoading: false,
    isFetchingMore: false,
    onLastRowVisible: fn(async () => undefined),
    onRetry,
    timelineThreads: undefined,
  },
  beforeEach: () => {
    onRetry.mockClear();
    jotaiStore.set(
      timelineThreadChannelFilterFamilyState.atomFamily(TARGET_RECORD_ID),
      {
        type: MessageChannelType.EMAIL,
        provider: 'microsoft',
        applicationId: null,
      },
    );
  },
};

export default meta;
type Story = StoryObj<typeof EmailsCardContent>;

export const LoadError: Story = {
  args: { error: new Error('Network error') },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByText("We couldn't load the messages"),
    ).toBeVisible();
    await expect(canvas.queryByText('No messages yet')).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Try again' }));

    await expect(onRetry).toHaveBeenCalledTimes(1);
  },
};

export const NoMatchingConversation: Story = {
  args: { isFiltered: true, timelineThreads: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByText('No matching conversations'),
    ).toBeVisible();
    await expect(canvas.queryByText('No messages yet')).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Clear filter' }));

    await waitFor(() => expect(getTimelineThreadChannelFilter()).toBeNull());
  },
};
