import { RecordTableWidgetJunctionAddNewRow } from '@/object-record/record-table-widget/components/RecordTableWidgetJunctionAddNewRow';
import { RecordTableWidgetNestedRelationAddNewRow } from '@/object-record/record-table-widget/components/RecordTableWidgetNestedRelationAddNewRow';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import { getEmptyPageInfo } from '@/object-record/cache/utils/getEmptyPageInfo';
import { Toaster } from 'twenty-ui/components/feedback';
import { Section } from 'twenty-ui/components/layout';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ContextStoreDecorator } from '~/testing/decorators/ContextStoreDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { RecordTableDecorator } from '~/testing/decorators/RecordTableDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedPersonRecords } from '~/testing/mock-data/generated/data/people/mock-people-data';
import { mockedTaskRecords } from '~/testing/mock-data/generated/data/tasks/mock-tasks-data';
import { mockedUserData } from '~/testing/mock-data/users';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const PEOPLE_FILTER: RecordGqlOperationFilter = {
  companyId: { eq: mockedPersonRecords[0].companyId },
};
const junctionObject = getMockObjectMetadataItemOrThrow('taskTarget');
const person = mockedPersonRecords[0];
const personName = `${person.name.firstName} ${person.name.lastName}`;
const onRelationRecordSelected = fn();
let lastRecordsFilter: unknown;

const junctionCreateThrough = {
  junctionObjectMetadataId: junctionObject.id,
  junctionObjectMetadataNameSingular: 'taskTarget',
  sourceJoinColumnName: 'taskId',
  sourceRecordId: mockedTaskRecords[0].id,
  targetJoinColumnName: 'targetPersonId',
  targetObjectMetadataNameSingular: 'person',
  targetRecordsFilter: PEOPLE_FILTER,
};

const AddNewRowStory = ({ junction = false }: { junction?: boolean }) => (
  <Section.Root role="region" aria-label="Related records">
    <Toaster getToastProps={() => ({ progress: 100 })} />
    {junction ? (
      <RecordTableWidgetJunctionAddNewRow
        dropdownId="table-widget-junction-group-story"
        junctionCreateThrough={junctionCreateThrough}
      />
    ) : (
      <RecordTableWidgetNestedRelationAddNewRow
        dropdownId="table-widget-nested-group-story"
        nestedRelationCreateThrough={{
          relationObjectMetadataNameSingular: 'person',
          relationRecordsFilter: PEOPLE_FILTER,
          nestedRelationJoinColumnName: 'personId',
        }}
        onRelationRecordSelected={onRelationRecordSelected}
      />
    )}
  </Section.Root>
);

const peopleHandler = graphql.query('FindManyPeople', ({ variables }) => {
  lastRecordsFilter = variables.filter;
  const records = JSON.stringify(variables.filter).includes('missing-record')
    ? []
    : [person];

  return HttpResponse.json({
    data: {
      people: {
        __typename: 'PersonConnection',
        edges: records.map((node) => ({
          __typename: 'PersonEdge',
          node,
          cursor: '',
        })),
        pageInfo: getEmptyPageInfo(),
        totalCount: records.length,
      },
    },
  });
});

const meta: Meta<typeof AddNewRowStory> = {
  title: 'Modules/ObjectRecord/RecordTableWidget/AddNewRow',
  component: AddNewRowStory,
  decorators: [
    ComponentDecorator,
    MemoryRouterDecorator,
    RecordTableDecorator,
    ContextStoreDecorator,
    ToastDecorator,
    ObjectMetadataItemsDecorator,
  ],
  beforeEach: () => {
    onRelationRecordSelected.mockClear();
    lastRecordsFilter = undefined;
  },
  parameters: {
    recordTableObjectNameSingular: 'company',
    msw: { handlers: [peopleHandler, ...graphqlMocks.handlers] },
  },
};

export default meta;
type Story = StoryObj<typeof AddNewRowStory>;

export const SearchAndSelect: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await canvas.findByRole('button', { name: 'Add New' });
    expect(trigger).toHaveAttribute('tabindex', '0');
    await userEvent.click(trigger);
    const popup = await body.findByRole('dialog', { name: 'Add New' });
    const search = within(popup).getByPlaceholderText('Search');
    await userEvent.type(search, person.name.firstName);
    const option = await within(popup).findByRole('button', {
      name: personName,
    });
    await waitFor(() =>
      expect(search).toHaveAttribute('aria-activedescendant', option.id),
    );
    await waitFor(() =>
      expect(JSON.stringify(lastRecordsFilter)).toContain(
        JSON.stringify(PEOPLE_FILTER).slice(1, -1),
      ),
    );
    await userEvent.keyboard('{Enter}');
    expect(onRelationRecordSelected).toHaveBeenCalledWith(person.id);
    await waitFor(() => expect(popup).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const NoRecordsFound: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Add New' }),
    );
    const popup = await body.findByRole('dialog', { name: 'Add New' });
    await userEvent.type(
      within(popup).getByPlaceholderText('Search'),
      'missing-record',
    );
    expect(await within(popup).findByText('No records found')).toBeVisible();
    await userEvent.keyboard('{Enter}');
    expect(onRelationRecordSelected).not.toHaveBeenCalled();
    expect(popup).toBeVisible();
    await userEvent.keyboard('{Escape}');
  },
};

export const JunctionFailure: Story = {
  args: { junction: true },
  parameters: {
    msw: {
      handlers: [
        graphql.mutation('CreateTaskTargets', () =>
          HttpResponse.json({ errors: [{ message: 'Failed to link record' }] }),
        ),
        peopleHandler,
        ...graphqlMocks.handlers,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Add New' }),
    );
    const popup = await body.findByRole('dialog', { name: 'Add New' });
    await userEvent.click(
      await within(popup).findByRole('button', { name: personName }),
    );
    await waitFor(() => expect(popup).not.toBeInTheDocument());
    expect(await body.findByText('Failed to add record')).toBeVisible();
  },
};

export const ReadOnlyJunction: Story = {
  args: { junction: true },
  parameters: {
    currentUserWorkspace: {
      ...mockedUserData.currentUserWorkspace,
      objectsPermissions:
        mockedUserData.currentUserWorkspace.objectsPermissions.map(
          (permission) => ({
            ...permission,
            canUpdateObjectRecords:
              permission.objectMetadataId === junctionObject.id
                ? false
                : permission.canUpdateObjectRecords,
          }),
        ),
    },
  },
  play: async ({ canvasElement }) => {
    const region = await within(canvasElement).findByRole('region', {
      name: 'Related records',
    });
    expect(
      within(region).queryByRole('button', { name: 'Add New' }),
    ).not.toBeInTheDocument();
  },
};
