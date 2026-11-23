import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import { expect, userEvent, within } from 'storybook/test';
import { Temporal } from 'temporal-polyfill';
import { themeCssVariables } from 'twenty-ui/theme';

import { calendarBookingPageIdState } from '@/client-config/states/calendarBookingPageIdState';
import { GettingStartedBookCallAction } from '@/getting-started/components/GettingStartedBookCallAction';
import { CAL_API } from '@/getting-started/constants/CalApi';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import { workspaceMemberFormatPreferencesState } from '@/localization/states/workspaceMemberFormatPreferencesState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { MOCKED_DATE } from '~/testing/constants/MockedDate';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';

const STORY_TIME_ZONE = 'Europe/Paris';

const VIEWPORT_OPTIONS = {
  tallDesktop: {
    name: 'Tall desktop',
    styles: { width: '1200px', height: '1080px' },
  },
  shortDesktop: {
    name: 'Short desktop',
    styles: { width: '1200px', height: '780px' },
  },
};

const StyledFrame = styled.div`
  padding: ${themeCssVariables.spacing[6]};
  width: 660px;
`;

const today = Temporal.Instant.from(MOCKED_DATE)
  .toZonedDateTimeISO(STORY_TIME_ZONE)
  .toPlainDate();

const getSlot = ({
  day,
  startTime,
}: {
  day: Temporal.PlainDate;
  startTime: string;
}) => {
  const start = day.toZonedDateTime({
    timeZone: STORY_TIME_ZONE,
    plainTime: startTime,
  });

  return {
    start: start.toInstant().toString(),
    end: start.add({ minutes: 15 }).toInstant().toString(),
  };
};

const SLOTS_BY_DAY = Object.fromEntries(
  [today.add({ days: 1 }), today.add({ days: 2 }), today.add({ days: 6 })].map(
    (day) => [
      day.toString(),
      [
        getSlot({ day, startTime: '09:00' }),
        getSlot({ day, startTime: '14:30' }),
      ],
    ],
  ),
);

const CAL_EMBED_SCRIPT_HANDLER = http.get(
  'https://app.cal.com/embed/embed.js',
  () =>
    new HttpResponse('', {
      headers: { 'Content-Type': 'text/javascript' },
    }),
);

const meta: Meta<typeof GettingStartedBookCallAction> = {
  title: 'Modules/GettingStarted/GettingStartedBookCallAction',
  component: GettingStartedBookCallAction,
  decorators: [
    (Story) => (
      <StyledFrame>
        <Story />
      </StyledFrame>
    ),
    ToastDecorator,
    ComponentWithRouterDecorator,
  ],
  parameters: {
    viewport: { options: VIEWPORT_OPTIONS },
    msw: {
      handlers: [
        http.get(`${CAL_API.url}/slots`, () =>
          HttpResponse.json({ status: 'success', data: SLOTS_BY_DAY }),
        ),
        CAL_EMBED_SCRIPT_HANDLER,
      ],
    },
  },
  globals: { viewport: { value: 'tallDesktop' } },
  beforeEach: () => {
    jotaiStore.set(calendarBookingPageIdState.atom, 'team/twenty/talk-to-us');
    jotaiStore.set(
      workspaceMemberFormatPreferencesState.atom,
      (formatPreferences) => ({
        ...formatPreferences,
        timeZone: STORY_TIME_ZONE,
        timeFormat: TimeFormat.HOUR_24,
      }),
    );
  },
};

export default meta;

type Story = StoryObj<typeof GettingStartedBookCallAction>;

export const OpenOnAvailableDay: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await expect(await canvas.findByText('15 min')).toBeVisible();

    const [firstAvailableDay] = await canvas.findAllByRole('gridcell', {
      name: /^Choose /,
    });

    await userEvent.click(firstAvailableDay);

    await expect(
      await body.findByRole('heading', { name: 'Talk to our team' }),
    ).toBeInTheDocument();
  },
};

export const OpenFromPickATime: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Pick a time' }),
    );

    await expect(
      await body.findByRole('heading', { name: 'Talk to our team' }),
    ).toBeInTheDocument();
  },
};

export const ShortViewport: Story = {
  globals: { viewport: { value: 'shortDesktop' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await expect(await canvas.findByText('15 min')).toBeVisible();
    await expect(
      canvas.getByRole('group', { name: 'Choose a date', hidden: true }),
    ).not.toBeVisible();

    await userEvent.click(canvas.getByRole('button', { name: 'Pick a time' }));

    await expect(
      await body.findByRole('heading', { name: 'Talk to our team' }),
    ).toBeInTheDocument();
  },
};

export const SlotsRequestFailed: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get(
          `${CAL_API.url}/slots`,
          () => new HttpResponse(null, { status: 500 }),
        ),
        CAL_EMBED_SCRIPT_HANDLER,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByText('Pick a time that suits you'),
    ).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: 'Pick a time' }),
    ).toBeEnabled();
  },
};
