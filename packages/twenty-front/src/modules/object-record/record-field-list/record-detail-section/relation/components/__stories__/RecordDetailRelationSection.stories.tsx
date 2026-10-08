import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { isDefined } from 'twenty-shared/utils';

import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { getRecordFromRecordNode } from '@/object-record/cache/utils/getRecordFromRecordNode';
import { RecordFieldsScopeContextProvider } from '@/object-record/record-field-list/contexts/RecordFieldsScopeContext';
import { RecordDetailRelationSection } from '@/object-record/record-field-list/record-detail-section/relation/components/RecordDetailRelationSection';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { ComponentDecorator } from 'twenty-ui/testing';
import { PageLayoutType } from '~/generated-metadata/graphql';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { RecordStoreDecorator } from '~/testing/decorators/RecordStoreDecorator';
import { SidePanelDecorator } from '~/testing/decorators/SidePanelDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedCompanyRecords } from '~/testing/mock-data/generated/data/companies/mock-companies-data';
import { mockedPersonRecords } from '~/testing/mock-data/generated/data/people/mock-people-data';
import { mockedWorkspaceMemberRecords } from '~/testing/mock-data/generated/data/workspaceMembers/mock-workspaceMembers-data';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const mockedCompanyObjectMetadataItem =
  getTestEnrichedObjectMetadataItemsMock().find(
    (item) => item.nameSingular === 'company',
  );

if (!mockedCompanyObjectMetadataItem) {
  throw new Error('Company object metadata item not found');
}

const meta: Meta<typeof RecordDetailRelationSection> = {
  title:
    'Modules/ObjectRecord/RecordShow/RecordDetailSection/RecordDetailRelationSection',
  component: RecordDetailRelationSection,
  decorators: [
    (Story, { parameters }) => (
      <LayoutRenderingProvider
        value={{
          targetRecordIdentifier: {
            id: mockedCompanyRecords[0].id,
            targetObjectNameSingular: 'company',
          },
          layoutType: PageLayoutType.RECORD_PAGE,
        }}
      >
        <ContextStoreComponentInstanceContext.Provider
          value={{ instanceId: 'mock-instance-id' }}
        >
          <FieldContext.Provider
            value={{
              recordId: mockedCompanyRecords[0].id,
              isLabelIdentifier: false,
              fieldDefinition: formatFieldMetadataItemAsFieldDefinition({
                field: mockedCompanyObjectMetadataItem.fields.find(
                  ({ name }) => name === 'people',
                )!,
                objectMetadataItem: mockedCompanyObjectMetadataItem,
              }),
              isRecordFieldReadOnly: parameters.readOnly ?? false,
            }}
          >
            <RecordFieldsScopeContextProvider
              value={{ scopeInstanceId: 'mock-instance-id' }}
            >
              <Story />
            </RecordFieldsScopeContextProvider>
          </FieldContext.Provider>
        </ContextStoreComponentInstanceContext.Provider>
      </LayoutRenderingProvider>
    ),
    SidePanelDecorator,
    ComponentDecorator,
    ObjectMetadataItemsDecorator,
    ToastDecorator,
    MemoryRouterDecorator,
  ],
  parameters: {
    msw: graphqlMocks,
    records: mockedCompanyRecords,
  },
};

export default meta;
type Story = StoryObj<typeof RecordDetailRelationSection>;

export const EmptyState: Story = {};

const flatPersonRecords = mockedPersonRecords.map((record) =>
  getRecordFromRecordNode({ recordNode: record }),
);

const onDetach = fn();

const withRecordsParameters = {
  msw: {
    handlers: [
      graphql.query('AggregatePeople', () =>
        HttpResponse.json({
          data: {
            people: {
              __typename: 'PersonConnection',
              totalCount: flatPersonRecords.length,
            },
          },
        }),
      ),
      graphql.query('FindOneWorkspaceMember', ({ variables }) =>
        HttpResponse.json({
          data: {
            workspaceMember:
              mockedWorkspaceMemberRecords.find(
                (record) => record.id === variables.objectRecordId,
              ) ?? null,
          },
        }),
      ),
      graphql.mutation('UpdateOnePerson', ({ variables }) => {
        onDetach(variables);
        return HttpResponse.json({
          data: {
            updatePerson: {
              ...mockedPersonRecords[0],
              companyId: null,
              company: null,
            },
          },
        });
      }),
      ...graphqlMocks.handlers,
    ],
  },
  records: [
    {
      ...mockedCompanyRecords[0],
      people: flatPersonRecords,
    },
    ...flatPersonRecords,
  ],
};

export const WithRecords: Story = {
  decorators: [RecordStoreDecorator],
  beforeEach: () => {
    onDetach.mockClear();
  },
  parameters: withRecordsParameters,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = (
      await canvas.findAllByRole('button', { name: 'More options' })
    )[0];
    const row = trigger.parentElement;
    if (!isDefined(row)) {
      throw new Error('Relation row not found');
    }
    await userEvent.hover(row);
    trigger.focus();
    expect(trigger).toHaveStyle({ opacity: '1', pointerEvents: 'auto' });
    await userEvent.click(trigger);
    const menu = await body.findByRole('menu', { name: 'More options' });
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(menu).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.unhover(row);
    expect(trigger).toHaveStyle({ opacity: '1' });
    await userEvent.click(trigger);
    const deleteMenu = await body.findByRole('menu', { name: 'More options' });
    await userEvent.click(
      within(deleteMenu).getByRole('menuitem', { name: 'Delete' }),
    );
    await waitFor(() => expect(deleteMenu).not.toBeInTheDocument());
    const confirmation = await body.findByRole('dialog', {
      name: 'Delete Related Person',
    });
    expect(
      within(confirmation).getByRole('button', { name: 'Delete Person' }),
    ).toBeVisible();
    await waitFor(() =>
      expect(confirmation).toContainElement(
        canvasElement.ownerDocument.querySelector<HTMLElement>(':focus'),
      ),
    );
    await userEvent.click(
      within(confirmation).getByRole('button', { name: 'Cancel' }),
    );
    await userEvent.hover(row);
    await userEvent.click(trigger);
    const reopenedMenu = await body.findByRole('menu', {
      name: 'More options',
    });
    await userEvent.click(
      within(reopenedMenu).getByRole('menuitem', { name: 'Detach' }),
    );
    await waitFor(() => expect(reopenedMenu).not.toBeInTheDocument());
    await waitFor(() =>
      expect(onDetach).toHaveBeenCalledWith(
        expect.objectContaining({
          idToUpdate: flatPersonRecords[0].id,
          input: expect.objectContaining({ companyId: null }),
        }),
      ),
    );
  },
};

export const ReadOnly: Story = {
  decorators: [RecordStoreDecorator],
  parameters: { ...withRecordsParameters, readOnly: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findAllByRole('button', { name: 'Expand relation' });
    expect(
      canvas.queryByRole('button', { name: 'More options' }),
    ).not.toBeInTheDocument();
  },
};
