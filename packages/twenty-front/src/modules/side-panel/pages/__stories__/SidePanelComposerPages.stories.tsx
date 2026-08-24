import { useEffect, useState } from 'react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useStore } from 'jotai';
import { graphql, HttpResponse } from 'msw';
import { expect, userEvent, within } from 'storybook/test';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { ComponentDecorator, RouterDecorator } from 'twenty-ui/testing';

import { SidePanelComposeCalendarEventPage } from '@/side-panel/pages/compose-calendar-event/components/SidePanelComposeCalendarEventPage';
import { composeCalendarEventInitialValuesComponentState } from '@/side-panel/pages/compose-calendar-event/states/composeCalendarEventInitialValuesComponentState';
import { SidePanelComposeEmailPage } from '@/side-panel/pages/compose-email/components/SidePanelComposeEmailPage';
import { composeEmailConnectedAccountIdComponentState } from '@/side-panel/pages/compose-email/states/composeEmailConnectedAccountIdComponentState';
import { composeEmailContextRecordComponentState } from '@/side-panel/pages/compose-email/states/composeEmailContextRecordComponentState';
import { composeEmailDefaultSubjectComponentState } from '@/side-panel/pages/compose-email/states/composeEmailDefaultSubjectComponentState';
import { composeEmailDefaultToComponentState } from '@/side-panel/pages/compose-email/states/composeEmailDefaultToComponentState';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const STORY_PAGE_INSTANCE_ID = 'side-panel-composer-story';
const GOOGLE_ACCOUNT_ID = '20202020-9ac0-4390-9a1a-ab4d2c4e1bb7';
const MICROSOFT_ACCOUNT_ID = '20202020-87f5-4c87-b32a-a5d34b1fbfc1';
const KIMBERLY_PERSON_ID = '20202020-2f6b-4e2f-b024-3f4f6c2f9b24';

const storyConnectedAccounts = [
  {
    id: GOOGLE_ACCOUNT_ID,
    handle: 'tim@apple.dev',
    provider: 'google',
    authFailedAt: null,
    archivedAt: null,
    scopes: ['https://www.googleapis.com/auth/calendar.events'],
    handleAliases: '',
    lastSignedInAt: '2026-08-24T08:00:00.000Z',
    userWorkspaceId: '20202020-0687-4c41-b707-ed1bfca972a7',
    connectionProviderId: null,
    name: 'Tim Apple',
    visibility: 'SHARE_EVERYTHING',
    lastCredentialsRefreshedAt: '2026-08-24T08:00:00.000Z',
    connectionParameters: null,
    createdAt: '2026-02-27T01:17:25.392Z',
    updatedAt: '2026-08-24T08:00:00.000Z',
  },
  {
    id: MICROSOFT_ACCOUNT_ID,
    handle: 'tim@twenty.com',
    provider: 'microsoft',
    authFailedAt: null,
    archivedAt: null,
    scopes: ['Calendars.ReadWrite'],
    handleAliases: '',
    lastSignedInAt: '2026-08-23T08:00:00.000Z',
    userWorkspaceId: '20202020-0687-4c41-b707-ed1bfca972a7',
    connectionProviderId: null,
    name: 'Tim Apple',
    visibility: 'SHARE_EVERYTHING',
    lastCredentialsRefreshedAt: '2026-08-23T08:00:00.000Z',
    connectionParameters: null,
    createdAt: '2026-03-12T01:17:25.392Z',
    updatedAt: '2026-08-23T08:00:00.000Z',
  },
];

const storyCalendarChannels = storyConnectedAccounts.map((account, index) => ({
  __typename: 'CalendarChannel',
  id: `20202020-3298-45e2-a3a2-00000000000${index}`,
  handle: account.handle,
  visibility: 'SHARE_EVERYTHING',
  isContactAutoCreationEnabled: false,
  contactAutoCreationPolicy: 'AS_PARTICIPANT_AND_ORGANIZER',
  isSyncEnabled: true,
  syncStatus: 'ACTIVE',
  syncStage: 'CALENDAR_EVENTS_IMPORT_ONGOING',
  syncStageStartedAt: null,
  connectedAccountId: account.id,
  createdAt: account.createdAt,
  updatedAt: account.updatedAt,
}));

type SidePanelComposerStoryProps = {
  composer: 'calendar-event' | 'email';
};

const useInitializeSidePanelComposerStory = ({
  composer,
}: SidePanelComposerStoryProps) => {
  const store = useStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const atomFamilyParams = { instanceId: STORY_PAGE_INSTANCE_ID };

    if (composer === 'calendar-event') {
      store.set(
        composeCalendarEventInitialValuesComponentState.atomFamily(
          atomFamilyParams,
        ),
        {
          connectedAccountId: GOOGLE_ACCOUNT_ID,
          contextRecord: {
            objectNameSingular: CoreObjectNameSingular.Person,
            recordId: KIMBERLY_PERSON_ID,
          },
          defaultAttendees: 'Kimberly Gordon <kimberly.gordon@apple.dev>',
          defaultAttendeePersonId: KIMBERLY_PERSON_ID,
          timeZone: 'Europe/Paris',
        },
      );
    } else {
      store.set(
        composeEmailConnectedAccountIdComponentState.atomFamily(
          atomFamilyParams,
        ),
        GOOGLE_ACCOUNT_ID,
      );
      store.set(
        composeEmailDefaultToComponentState.atomFamily(atomFamilyParams),
        'Kimberly Gordon <kimberly.gordon@apple.dev>',
      );
      store.set(
        composeEmailDefaultSubjectComponentState.atomFamily(atomFamilyParams),
        'Follow-up from our meeting',
      );
      store.set(
        composeEmailContextRecordComponentState.atomFamily(atomFamilyParams),
        null,
      );
    }

    setIsReady(true);
  }, [composer, store]);

  return { isReady };
};

const SidePanelComposerStory = ({ composer }: SidePanelComposerStoryProps) => {
  const { isReady } = useInitializeSidePanelComposerStory({ composer });

  return (
    <SidePanelPageComponentInstanceContext.Provider
      value={{ instanceId: STORY_PAGE_INSTANCE_ID }}
    >
      {isReady &&
        (composer === 'calendar-event' ? (
          <SidePanelComposeCalendarEventPage />
        ) : (
          <SidePanelComposeEmailPage />
        ))}
    </SidePanelPageComponentInstanceContext.Provider>
  );
};

const meta = {
  title: 'Modules/SidePanel/ComposerPages',
  component: SidePanelComposerStory,
  parameters: {
    container: { width: 480, height: 720 },
    msw: {
      handlers: [
        graphql.query('MyConnectedAccounts', () =>
          HttpResponse.json({
            data: { myConnectedAccounts: storyConnectedAccounts },
          }),
        ),
        graphql.query('MyMessageChannels', () =>
          HttpResponse.json({ data: { myMessageChannels: [] } }),
        ),
        graphql.query('MyCalendarChannels', () =>
          HttpResponse.json({
            data: { myCalendarChannels: storyCalendarChannels },
          }),
        ),
        graphql.query('GetTimelineCalendarEventsFromObjectRecord', () =>
          HttpResponse.json({
            data: {
              getTimelineCalendarEventsFromObjectRecord: {
                __typename: 'TimelineCalendarEventsWithTotal',
                totalNumberOfCalendarEvents: 0,
                relatedPersonIds: [KIMBERLY_PERSON_ID],
                timelineCalendarEvents: [],
              },
            },
          }),
        ),
        graphql.query('GetAutoCompleteAddress', () =>
          HttpResponse.json({
            data: { getAutoCompleteAddress: [] },
          }),
        ),
        graphql.query('FindOnePerson', () =>
          HttpResponse.json({
            data: {
              person: {
                __typename: 'Person',
                id: KIMBERLY_PERSON_ID,
                companyId: null,
              },
            },
          }),
        ),
        ...graphqlMocks.handlers,
      ],
    },
  },
  decorators: [
    ComponentDecorator,
    ObjectMetadataItemsDecorator,
    SnackBarDecorator,
    RouterDecorator,
    WorkspaceDecorator,
  ],
} satisfies Meta<typeof SidePanelComposerStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const CalendarEvent: Story = {
  args: { composer: 'calendar-event' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Kimberly Gordon')).toBeVisible();
    expect(canvas.getByText('tim@apple.dev')).toBeVisible();

    await userEvent.type(
      canvas.getByPlaceholderText('Add an event title'),
      'Product review',
    );
    await userEvent.type(
      canvas.getByPlaceholderText('Add a location'),
      'Apple Park',
    );

    expect(canvas.getByRole('button', { name: /^Create event/ })).toBeEnabled();
  },
};

export const Email: Story = {
  args: { composer: 'email' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Kimberly Gordon')).toBeVisible();
    expect(
      canvas.getByDisplayValue('Follow-up from our meeting'),
    ).toBeVisible();
    expect(canvas.getByRole('button', { name: /^Send/ })).toBeEnabled();
  },
};
