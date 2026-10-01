import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Button } from 'twenty-ui/primitives/input';
import { ComponentDecorator } from 'twenty-ui/testing';

import { CalendarEventComposerTargetsInput } from '@/activities/calendar/components/CalendarEventComposerTargetsInput';
import { CalendarEventTargetsStoryMetadataEffect } from '@/activities/calendar/components/__stories__/CalendarEventTargetsStoryMetadataEffect';
import { getCalendarEventTargetsStoryMetadata } from '@/activities/calendar/components/__stories__/getCalendarEventTargetsStoryMetadata';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedPersonRecords } from '~/testing/mock-data/generated/data/people/mock-people-data';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const PERSON_OBJECT_METADATA_ID = getTestEnrichedObjectMetadataItemsMock().find(
  ({ nameSingular }) => nameSingular === 'person',
)?.id;

const meta: Meta<typeof CalendarEventComposerTargetsInput> = {
  title: 'Modules/Activities/Calendar/CalendarEventComposerTargetsInput',
  component: CalendarEventComposerTargetsInput,
  decorators: [
    MemoryRouterDecorator,
    ComponentDecorator,
    ObjectMetadataItemsDecorator,
    ToastDecorator,
    (Story, { loaded }) => (
      <>
        <CalendarEventTargetsStoryMetadataEffect metadata={loaded.metadata} />
        <Story />
      </>
    ),
  ],
  loaders: [
    async () => ({ metadata: await getCalendarEventTargetsStoryMetadata() }),
  ],
  args: {
    targets: mockedPersonRecords.slice(0, 4).map((record) => ({
      objectMetadataId: PERSON_OBJECT_METADATA_ID ?? '',
      recordId: record.id,
      record,
    })),
    onTargetChange: fn(),
  },
  parameters: {
    container: { width: 220 },
    msw: graphqlMocks,
  },
  render: (args) => (
    <>
      <CalendarEventComposerTargetsInput {...args} />
      <Button variant="ghost">Outside calendar field</Button>
    </>
  ),
};

export default meta;
type Story = StoryObj<typeof CalendarEventComposerTargetsInput>;

export const OverflowAndPicker: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const overflowButton = await canvas.findByRole('button', {
      name: 'Show all items',
    });
    const pickerButton = canvas.getByRole('button', {
      name: 'Add a related record',
    });

    expect(overflowButton.closest('[role="button"]')).toBeNull();
    expect(pickerButton.closest('[role="button"]')).toBeNull();

    await userEvent.click(overflowButton);

    expect(await body.findByRole('dialog')).toBeVisible();
    expect(body.queryAllByRole('listbox')).toHaveLength(0);
    expect(pickerButton).toHaveAttribute('aria-expanded', 'false');

    await userEvent.keyboard('{Escape}');
    await userEvent.click(canvas.getByText('Jeffery Griffin'));

    expect(await body.findByRole('textbox')).toBeVisible();
    expect(pickerButton).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(
      await body.findByRole('option', { name: /Jeffery Griffin/ }),
    );
    expect(args.onTargetChange).toHaveBeenCalled();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Outside calendar field' }),
    );
    await waitFor(() => expect(body.queryAllByRole('listbox')).toHaveLength(0));
  },
};

export const EmptyKeyboardActivation: Story = {
  args: { targets: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const pickerButton = await canvas.findByRole('button', {
      name: 'Add a related record',
    });

    await userEvent.tab();
    expect(pickerButton).toHaveFocus();
    await userEvent.keyboard('{Enter}');

    expect(await body.findByRole('textbox')).toBeVisible();
    expect(pickerButton).toHaveAttribute('aria-expanded', 'true');

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryAllByRole('listbox')).toHaveLength(0));
  },
};
