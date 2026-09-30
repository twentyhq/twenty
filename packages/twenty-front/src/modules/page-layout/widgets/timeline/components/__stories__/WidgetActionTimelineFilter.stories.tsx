import { timelineActivityTypeUniversalIdentifiersFilterFamilyState } from '@/activities/timeline-activities/states/timelineActivityTypeUniversalIdentifiersFilterFamilyState';
import { WidgetActionTimelineFilter } from '@/page-layout/widgets/timeline/components/WidgetActionTimelineFilter';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { ComponentDecorator } from 'twenty-ui/testing';
import {
  type FindManyTimelineActivityTypesQuery,
  PageLayoutType,
} from '~/generated-metadata/graphql';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedApolloClient } from '~/testing/mockedApolloClient';

const TARGET_RECORD_ID = 'story-company';

type TimelineActivityTypeMock =
  FindManyTimelineActivityTypesQuery['timelineActivityTypes'][number];

const createTimelineActivityType = ({
  universalIdentifier,
  label,
  icon,
  isActive = true,
}: {
  universalIdentifier: string;
  label: string;
  icon: string;
  isActive?: boolean;
}): TimelineActivityTypeMock => ({
  __typename: 'TimelineActivityType',
  id: `${universalIdentifier}-id`,
  applicationId: null,
  universalIdentifier,
  name: universalIdentifier,
  label,
  icon,
  frontComponentUniversalIdentifier: null,
  isActive,
  emit: null,
});

const TIMELINE_ACTIVITY_TYPES = [
  createTimelineActivityType({
    universalIdentifier: 'record-created',
    label: 'Record created',
    icon: 'IconPlus',
  }),
  createTimelineActivityType({
    universalIdentifier: 'meeting-scheduled',
    label: 'Réunion planifiée',
    icon: 'IconCalendarEvent',
  }),
  createTimelineActivityType({
    universalIdentifier: 'record-archived',
    label: 'Record archived',
    icon: 'IconArchive',
    isActive: false,
  }),
];

const mockTimelineActivityTypes = (
  timelineActivityTypes: TimelineActivityTypeMock[],
) => ({
  handlers: [
    ...graphqlMocks.handlers,
    graphql.query('FindManyTimelineActivityTypes', () =>
      HttpResponse.json({ data: { timelineActivityTypes } }),
    ),
  ],
});

const getTimelineActivityTypeFilter = () =>
  jotaiStore.get(
    timelineActivityTypeUniversalIdentifiersFilterFamilyState.atomFamily(
      TARGET_RECORD_ID,
    ),
  );

const meta: Meta<typeof WidgetActionTimelineFilter> = {
  title: 'Modules/PageLayout/Widgets/Timeline/WidgetActionTimelineFilter',
  component: WidgetActionTimelineFilter,
  decorators: [
    (Story) => (
      <LayoutRenderingProvider
        value={{
          layoutType: PageLayoutType.RECORD_PAGE,
          targetRecordIdentifier: {
            id: TARGET_RECORD_ID,
            targetObjectNameSingular: CoreObjectNameSingular.Company,
          },
        }}
      >
        <Story />
      </LayoutRenderingProvider>
    ),
    ComponentDecorator,
  ],
  parameters: {
    msw: mockTimelineActivityTypes(TIMELINE_ACTIVITY_TYPES),
  },
  beforeEach: async () => {
    await mockedApolloClient.clearStore();
  },
};

export default meta;
type Story = StoryObj<typeof WidgetActionTimelineFilter>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    expect(
      await within(canvasElement).findByRole(
        'button',
        { name: 'Filter timeline' },
        { timeout: 3000 },
      ),
    ).toBeVisible();
  },
};

export const FiltersActivityTypes: Story = {
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await within(canvasElement).findByRole(
      'button',
      { name: 'Filter timeline' },
      { timeout: 3000 },
    );

    await userEvent.click(trigger);

    const picker = await body.findByRole('dialog', {
      name: 'Filter timeline',
    });
    const search = within(picker).getByRole('searchbox', {
      name: 'Search activity types',
    });

    await waitFor(() => expect(search).toHaveFocus());
    expect(
      within(picker).queryByRole('button', { name: 'Record archived' }),
    ).not.toBeInTheDocument();

    await userEvent.type(search, 'reunion');

    expect(
      within(picker).getByRole('button', { name: 'Réunion planifiée' }),
    ).toBeVisible();
    expect(
      within(picker).queryByRole('button', { name: 'Record created' }),
    ).not.toBeInTheDocument();

    await userEvent.clear(search);
    await userEvent.type(search, 'zzz');

    expect(await within(picker).findByText('No results')).toBeVisible();

    await userEvent.clear(search);

    const recordCreated = within(picker).getByRole('button', {
      name: 'Record created',
    });

    await userEvent.click(recordCreated);

    expect(recordCreated).toHaveAttribute('aria-pressed', 'true');
    expect(getTimelineActivityTypeFilter()).toEqual(['record-created']);
    expect(picker).toBeVisible();

    await userEvent.click(
      within(picker).getByRole('button', { name: 'Clear filter' }),
    );

    expect(getTimelineActivityTypeFilter()).toEqual([]);
    expect(picker).toBeVisible();
    await waitFor(() =>
      expect(
        within(picker).queryByRole('button', { name: 'Clear filter' }),
      ).not.toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(picker.contains(canvasElement.ownerDocument.activeElement)).toBe(
        true,
      ),
    );

    await userEvent.type(search, 'record');
    await userEvent.keyboard('{Escape}');

    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );

    await userEvent.click(trigger);

    expect(
      await body.findByRole('searchbox', { name: 'Search activity types' }),
    ).toHaveValue('');
  },
};

export const HiddenWithoutActiveActivityTypes: Story = {
  parameters: {
    msw: mockTimelineActivityTypes([
      createTimelineActivityType({
        universalIdentifier: 'record-archived',
        label: 'Record archived',
        icon: 'IconArchive',
        isActive: false,
      }),
    ]),
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).findByRole(
        'button',
        { name: 'Filter timeline' },
        { timeout: 1500 },
      ),
    ).rejects.toThrow();
  },
};
