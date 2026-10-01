import { CalendarEventLocationInput } from '@/activities/calendar/components/CalendarEventLocationInput';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, delay, graphql } from 'msw';
import { useState } from 'react';
import { Button } from 'twenty-ui/primitives/input';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

const onAutocompleteRequest = fn();
const onAutocompleteResponse = fn();

const StatefulCalendarEventLocationInput = () => {
  const [value, setValue] = useState('');

  return (
    <>
      <CalendarEventLocationInput
        ariaLabel="Location"
        placeholder="Add a location"
        value={value}
        onChange={setValue}
      />
      <Button>Outside</Button>
    </>
  );
};

const meta: Meta<typeof CalendarEventLocationInput> = {
  title: 'Modules/Activities/Calendar/CalendarEventLocationInput',
  component: CalendarEventLocationInput,
  render: () => <StatefulCalendarEventLocationInput />,
  beforeEach: () => {
    onAutocompleteRequest.mockClear();
    onAutocompleteResponse.mockClear();
  },
  parameters: {
    mockingDate: null,
    msw: {
      handlers: [
        graphql.query('GetAutoCompleteAddress', async ({ variables }) => {
          onAutocompleteRequest(variables.address);

          if (variables.address === 'Paris') {
            await delay(900);
            onAutocompleteResponse(variables.address);

            return HttpResponse.json({
              data: {
                getAutoCompleteAddress: [
                  { text: 'Paris, France', placeId: 'paris' },
                ],
              },
            });
          }

          onAutocompleteResponse(variables.address);

          return HttpResponse.json({
            data: {
              getAutoCompleteAddress: [
                { text: 'London, United Kingdom', placeId: 'london' },
              ],
            },
          });
        }),
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof CalendarEventLocationInput>;

export const IgnoresStaleResponses: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(canvasElement.ownerDocument.body);
    const input = canvas.getByRole('combobox', { name: 'Location' });

    await userEvent.type(input, 'Paris');
    await waitFor(
      () => expect(onAutocompleteRequest).toHaveBeenCalledWith('Paris'),
      { timeout: 5000 },
    );
    await userEvent.clear(input);
    await userEvent.type(input, 'London');

    const londonOption = await screen.findByRole(
      'option',
      { name: 'London, United Kingdom' },
      { timeout: 5000 },
    );

    await waitFor(() => expect(londonOption).toBeVisible());

    await waitFor(
      () => expect(onAutocompleteResponse).toHaveBeenCalledWith('Paris'),
      { timeout: 5000 },
    );

    await waitFor(() => {
      expect(londonOption).toBeVisible();
      expect(screen.queryByText('Paris, France')).not.toBeInTheDocument();
    });
  },
};

export const SelectsWithoutMovingFocus: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(canvasElement.ownerDocument.body);
    const input = canvas.getByRole('combobox', { name: 'Location' });

    await userEvent.type(input, 'London');

    const option = await screen.findByRole(
      'option',
      { name: 'London, United Kingdom' },
      { timeout: 5000 },
    );

    expect(input).toHaveFocus();
    await userEvent.click(input);
    expect(option).toBeVisible();
    await userEvent.keyboard('{ArrowDown}{Enter}');

    await waitFor(() => {
      expect(input).toHaveValue('London, United Kingdom');
      expect(input).toHaveFocus();
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  },
};

export const DismissesWithoutSelecting: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(canvasElement.ownerDocument.body);
    const input = canvas.getByRole('combobox', { name: 'Location' });
    const outsideButton = canvas.getByRole('button', { name: 'Outside' });

    await userEvent.type(input, 'London');
    await screen.findByRole(
      'option',
      { name: 'London, United Kingdom' },
      { timeout: 5000 },
    );
    await userEvent.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(input).toHaveValue('London');
      expect(input).toHaveFocus();
    });

    await userEvent.type(input, ' UK');
    await screen.findByRole(
      'option',
      { name: 'London, United Kingdom' },
      { timeout: 5000 },
    );
    await userEvent.click(outsideButton);

    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(input).toHaveValue('London UK');
    });
  },
};
