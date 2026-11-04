import {
  type Decorator,
  type Meta,
  type StoryObj,
} from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { RecordCardBodyContainer } from '@/object-record/record-card/components/RecordCardBodyContainer';
import { FieldDisplay } from '@/object-record/record-field/ui/components/FieldDisplay';
import { FieldFocusStaticFocusedProvider } from '@/object-record/record-field/ui/contexts/FieldFocusContextProvider';
import { RecordInlineCellContainer } from '@/object-record/record-inline-cell/components/RecordInlineCellContainer';
import {
  RecordInlineCellContext,
  type RecordInlineCellContextProps,
} from '@/object-record/record-inline-cell/components/RecordInlineCellContext';
import { RecordInlineCellDisplayMode } from '@/object-record/record-inline-cell/components/RecordInlineCellDisplayMode';
import { IconCalendar, IconCurrencyDollar, IconPencil } from 'twenty-ui/icon';
import { ComponentDecorator } from 'twenty-ui/testing';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
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

const renderCardField = () => (
  <RecordCardBodyContainer>
    <FieldFocusStaticFocusedProvider>
      <RecordInlineCellContainer />
    </FieldFocusStaticFocusedProvider>
  </RecordCardBodyContainer>
);

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
    ToastDecorator,
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

export const CurrencyStaysOnOneLine: Story = {
  render: renderCardField,
  decorators: [
    getFieldDecorator('company', 'annualRecurringRevenue', {
      amountMicros: 100000000,
      currencyCode: 'USD',
    }),
    getInlineCellContextDecorator({
      IconLabel: IconCurrencyDollar,
      label: 'Amount',
      isDisplayModeFixHeight: true,
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const currencyDisplay = await canvas.findByText('100');
    const amountRange = document.createRange();

    amountRange.setStart(
      currencyDisplay,
      currencyDisplay.childNodes.length - 1,
    );
    amountRange.setEnd(currencyDisplay, currencyDisplay.childNodes.length);

    const amountBounds = amountRange.getBoundingClientRect();
    const displayBounds = currencyDisplay.getBoundingClientRect();

    expect(amountBounds.width).toBeGreaterThan(0);
    expect(amountBounds.top).toBeGreaterThanOrEqual(displayBounds.top);
    expect(amountBounds.bottom).toBeLessThanOrEqual(displayBounds.bottom);

    const currencySymbol = canvas.getByText('$', { exact: true });
    const [fieldIcon] = canvasElement.querySelectorAll('svg');
    const fieldIconBounds = fieldIcon.getBoundingClientRect();
    const currencySymbolBounds = currencySymbol.getBoundingClientRect();
    const amountCenter = amountBounds.top + amountBounds.height / 2;
    const fieldIconCenter = fieldIconBounds.top + fieldIconBounds.height / 2;
    const currencySymbolCenter =
      currencySymbolBounds.top + currencySymbolBounds.height / 2;

    expect(Math.abs(amountCenter - fieldIconCenter)).toBeLessThanOrEqual(1);
    expect(Math.abs(amountCenter - currencySymbolCenter)).toBeLessThanOrEqual(
      1,
    );
  },
};

export const DateTimeVerticallyCentered: Story = {
  render: renderCardField,
  decorators: [
    getFieldDecorator('task', 'dueAt', '2026-11-19T07:24:00.000Z'),
    getInlineCellContextDecorator({
      IconLabel: IconCalendar,
      label: 'Date',
      isDisplayModeFixHeight: true,
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dateDisplay = await canvas.findByText(/2026/);
    const dateRange = document.createRange();

    dateRange.setStart(dateDisplay, 0);
    dateRange.setEnd(dateDisplay, 1);

    const dateBounds = dateRange.getBoundingClientRect();
    const [fieldIcon] = canvasElement.querySelectorAll('svg');
    const fieldIconBounds = fieldIcon.getBoundingClientRect();
    const dateCenter = dateBounds.top + dateBounds.height / 2;
    const fieldIconCenter = fieldIconBounds.top + fieldIconBounds.height / 2;

    expect(dateBounds.width).toBeGreaterThan(0);
    expect(Math.abs(dateCenter - fieldIconCenter)).toBeLessThanOrEqual(1);
  },
};
