import {
  type Decorator,
  type Meta,
  type StoryObj,
} from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { FieldDisplay } from '@/object-record/record-field/ui/components/FieldDisplay';
import {
  RecordInlineCellContext,
  type RecordInlineCellContextProps,
} from '@/object-record/record-inline-cell/components/RecordInlineCellContext';
import { RecordInlineCellDisplayMode } from '@/object-record/record-inline-cell/components/RecordInlineCellDisplayMode';
import { IconPencil } from 'twenty-ui/icon';
import { ComponentDecorator } from 'twenty-ui/testing';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { getFieldDecorator } from '~/testing/decorators/getFieldDecorator';

const getInlineCellContextDecorator =
  (context: Partial<RecordInlineCellContextProps>): Decorator =>
  (Story) => (
    <RecordInlineCellContext.Provider
      value={{ buttonIcon: IconPencil, ...context }}
    >
      <Story />
    </RecordInlineCellContext.Provider>
  );

const spyOnClipboard = () => {
  const writeText = fn(async () => {});
  Object.defineProperty(window.navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
  });
  return writeText;
};

const meta: Meta<typeof RecordInlineCellDisplayMode> = {
  title: 'Modules/ObjectRecord/RecordInlineCell/RecordInlineCellDisplayMode',
  component: RecordInlineCellDisplayMode,
  decorators: [
    MemoryRouterDecorator,
    getFieldDecorator('person', 'emails', {
      primaryEmail: 'test@test.com',
      additionalEmails: [],
    }),
    getInlineCellContextDecorator({}),
    ComponentDecorator,
    SnackBarDecorator,
  ],
  args: {
    isHovered: true,
    children: <FieldDisplay />,
  },
};

export default meta;

type Story = StoryObj<typeof RecordInlineCellDisplayMode>;

export const HoveredCopiesEmail: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const writeText = spyOnClipboard();

    const copyButton = await canvas.findByLabelText('Copy');
    expect(copyButton).toBeVisible();
    expect(canvas.getAllByRole('button')).toHaveLength(2);

    await userEvent.click(copyButton);

    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith('test@test.com'),
    );

    expect(await canvas.findByText('test@test.com')).toBeVisible();
    expect(canvas.queryByRole('textbox')).toBeNull();
  },
};

export const NotHoveredHidesButtons: Story = {
  args: {
    isHovered: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(canvas.queryByLabelText('Copy')).toBeNull();
  },
};

export const ReadOnlyStillShowsCopy: Story = {
  decorators: [getInlineCellContextDecorator({ readonly: true })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByLabelText('Copy')).toBeVisible();
    expect(canvas.getAllByRole('button')).toHaveLength(1);
  },
};

export const CopiesPhoneNumber: Story = {
  decorators: [
    getFieldDecorator('person', 'phones', {
      primaryPhoneNumber: '5551234',
      primaryPhoneCallingCode: '+1',
      primaryPhoneCountryCode: 'US',
      additionalPhones: [],
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const writeText = spyOnClipboard();

    await userEvent.click(await canvas.findByLabelText('Copy'));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith('+15551234'));
  },
};

export const CopiesLinkUrl: Story = {
  decorators: [
    getFieldDecorator('person', 'linkedinLink', {
      primaryLinkUrl: 'https://www.linkedin.com/in/test',
      primaryLinkLabel: 'Test',
      secondaryLinks: [],
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const writeText = spyOnClipboard();

    await userEvent.click(await canvas.findByLabelText('Copy'));

    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith(
        'https://www.linkedin.com/in/test',
      ),
    );
  },
};
