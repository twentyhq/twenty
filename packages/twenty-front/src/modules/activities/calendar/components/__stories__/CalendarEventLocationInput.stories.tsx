import { CalendarEventLocationInput } from '@/activities/calendar/components/CalendarEventLocationInput';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, delay, graphql } from 'msw';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

const StatefulCalendarEventLocationInput = () => {
  const [value, setValue] = useState('');

  return (
    <CalendarEventLocationInput
      ariaLabel="Location"
      placeholder="Add a location"
      value={value}
      onChange={setValue}
    />
  );
};

const meta: Meta<typeof CalendarEventLocationInput> = {
  title: 'Modules/Activities/Calendar/CalendarEventLocationInput',
  component: CalendarEventLocationInput,
  render: () => <StatefulCalendarEventLocationInput />,
  parameters: {
    msw: {
      handlers: [
        graphql.query('GetAutoCompleteAddress', async ({ variables }) => {
          if (variables.address === 'Paris') {
            await delay(900);

            return HttpResponse.json({
              data: {
                getAutoCompleteAddress: [
                  { text: 'Paris, France', placeId: 'paris' },
                ],
              },
            });
          }

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
    const input = canvas.getByRole('textbox', { name: 'Location' });

    await userEvent.type(input, 'Paris');
    await delay(350);
    await userEvent.clear(input);
    await userEvent.type(input, 'London');

    expect(await screen.findByText('London, United Kingdom')).toBeVisible();

    await delay(700);

    expect(screen.queryByText('Paris, France')).not.toBeInTheDocument();
  },
};
