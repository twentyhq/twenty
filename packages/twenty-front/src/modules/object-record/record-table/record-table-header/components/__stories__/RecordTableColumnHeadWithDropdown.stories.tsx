import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { RecordFieldColumnsProvider } from '@/object-record/record-column-scope/components/RecordFieldColumnsProvider';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { RecordTableWithWrappers } from '@/object-record/record-table/components/RecordTableWithWrappers';
import { RecordTableColumnHeadWithDropdown } from '@/object-record/record-table/record-table-header/components/RecordTableColumnHeadWithDropdown';
import { isRecordTableColumnHeadersReadOnlyComponentState } from '@/object-record/record-table/states/isRecordTableColumnHeadersReadOnlyComponentState';
import { recordTableFocusPositionComponentState } from '@/object-record/record-table/states/recordTableFocusPositionComponentState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { ViewBarDetails } from '@/views/components/ViewBarDetails';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { act } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { AggregateOperations, FeatureFlagKey } from 'twenty-shared/types';
import { Button } from 'twenty-ui/primitives/input';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ContextStoreDecorator } from '~/testing/decorators/ContextStoreDecorator';
import { FileUploadDecorator } from '~/testing/decorators/FileUploadDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { PermissionFlagsDecorator } from '~/testing/decorators/PermissionFlagsDecorator';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { RecordTableDecorator } from '~/testing/decorators/RecordTableDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedCompanyRecords } from '~/testing/mock-data/generated/data/companies/mock-companies-data';
import { mockedWorkspaceMemberRecords } from '~/testing/mock-data/generated/data/workspaceMembers/mock-workspaceMembers-data';
import { mockedViews } from '~/testing/mock-data/generated/metadata/views/mock-views-data';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { sortByProperty } from '~/utils/array/sortByProperty';

const companyView = mockedViews.find((view) => view.name === 'All Companies')!;
const RECORD_INDEX_ID = `companies-${companyView.id}`;

const CompanyTable = () => (
  <>
    <Button>Outside table</Button>
    <ViewBarDetails viewBarId={RECORD_INDEX_ID} objectNamePlural="companies" />
    <RecordTableWithWrappers
      recordTableId={RECORD_INDEX_ID}
      viewBarId={RECORD_INDEX_ID}
      objectNameSingular="company"
    />
  </>
);

const meta: Meta = {
  title: 'Modules/ObjectRecord/RecordTable/RecordTableColumnHeadWithDropdown',
  component: RecordTableColumnHeadWithDropdown,
  decorators: [
    ComponentDecorator,
    MemoryRouterDecorator,
    FileUploadDecorator,
    RecordTableDecorator,
    ContextStoreDecorator,
    ToastDecorator,
    ObjectMetadataItemsDecorator,
  ],
  render: () => <CompanyTable />,
  parameters: {
    recordTableObjectNameSingular: 'company',
    msw: {
      handlers: [
        graphql.query('AggregateCompanies', () =>
          HttpResponse.json({
            data: {
              companies: {
                __typename: 'CompanyConnection',
                totalCount: mockedCompanyRecords.length,
                maxEmployees: 0,
                percentageEmptyLinkedinLink: 0,
                countNotEmptyAddress: 0,
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
        ...graphqlMocks.handlers,
      ],
    },
  },
};

export default meta;
type Story = StoryObj;

export const KeyboardMoveAndDismiss: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await canvas.findByRole('button', { name: 'Domain Name' });
    const scroll = canvasElement.querySelector(
      `#scroll-wrapper-record-table-scroll-${RECORD_INDEX_ID}`,
    );
    const focusState = recordTableFocusPositionComponentState.atomFamily({
      instanceId: RECORD_INDEX_ID,
    });
    const initialFocusPosition = jotaiStore.get(focusState);

    expect(trigger).toHaveAttribute('tabindex', '0');
    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');
    const menu = await body.findByRole('menu');
    expect(jotaiStore.get(focusState)).toEqual(initialFocusPosition);
    expect(scroll).not.toHaveClass('scroll-wrapper-x-enabled');
    expect(scroll).not.toHaveClass('scroll-wrapper-y-enabled');

    await userEvent.click(
      within(menu).getByRole('menuitem', { name: 'Move right' }),
    );
    expect(menu).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(menu).not.toBeInTheDocument());
    expect(scroll).toHaveClass('scroll-wrapper-x-enabled');
    expect(scroll).toHaveClass('scroll-wrapper-y-enabled');

    await userEvent.click(trigger);
    await body.findByRole('menu');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Outside table' }),
    );
    await waitFor(() =>
      expect(body.queryByRole('menu')).not.toBeInTheDocument(),
    );
    expect(scroll).toHaveClass('scroll-wrapper-x-enabled');
    expect(scroll).toHaveClass('scroll-wrapper-y-enabled');

    await userEvent.click(trigger);
    await userEvent.click(await body.findByRole('menuitem', { name: 'Sort' }));
    await waitFor(() =>
      expect(body.queryByRole('menu')).not.toBeInTheDocument(),
    );
    expect(scroll).toHaveClass('scroll-wrapper-y-enabled');

    await userEvent.click(trigger);
    const openMenu = await body.findByRole('menu');
    expect(scroll).not.toHaveClass('scroll-wrapper-x-enabled');
    expect(scroll).not.toHaveClass('scroll-wrapper-y-enabled');
    const readOnlyState =
      isRecordTableColumnHeadersReadOnlyComponentState.atomFamily({
        instanceId: RECORD_INDEX_ID,
      });
    await act(async () => {
      jotaiStore.set(readOnlyState, true);
    });
    await waitFor(() => expect(openMenu).not.toBeInTheDocument());
    expect(trigger).not.toBeInTheDocument();
    expect(scroll).toHaveClass('scroll-wrapper-x-enabled');
    expect(scroll).toHaveClass('scroll-wrapper-y-enabled');

    await act(async () => {
      jotaiStore.set(readOnlyState, false);
    });
    const restoredTrigger = await canvas.findByRole('button', {
      name: 'Domain Name',
      expanded: false,
    });
    await userEvent.click(restoredTrigger);
    const restoredMenu = await body.findByRole('menu');
    await userEvent.click(
      within(restoredMenu).getByRole('menuitem', { name: 'Hide' }),
    );
    await waitFor(() =>
      expect(body.queryByRole('menu')).not.toBeInTheDocument(),
    );
    expect(scroll).toHaveClass('scroll-wrapper-x-enabled');
    expect(scroll).toHaveClass('scroll-wrapper-y-enabled');
  },
};

export const FilterHandoff: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await canvas.findByRole('button', { name: 'Name' });
    const scroll = canvasElement.querySelector(
      `#scroll-wrapper-record-table-scroll-${RECORD_INDEX_ID}`,
    );

    await userEvent.click(trigger);
    await userEvent.click(
      await body.findByRole('menuitem', { name: 'Filter' }),
    );
    const input = await body.findByPlaceholderText('Name');
    await waitFor(() => expect(input).toHaveFocus());
    expect(body.queryByRole('menu')).not.toBeInTheDocument();
    expect(scroll).toHaveClass('scroll-wrapper-x-enabled');
    expect(scroll).toHaveClass('scroll-wrapper-y-enabled');
    await userEvent.type(input, 'Acme');
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(input).not.toBeInTheDocument());

    await userEvent.click(trigger);
    await userEvent.click(
      await body.findByRole('menuitem', { name: 'Filter' }),
    );
    const existingInput = await body.findByPlaceholderText('Name');
    expect(existingInput).toHaveValue('Acme');
    await waitFor(() => expect(existingInput).toHaveFocus());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(existingInput).not.toBeInTheDocument());
  },
};

const getMenuRows = (menu: HTMLElement) =>
  Array.from(
    menu.querySelectorAll('[role="menuitem"], [role="separator"]'),
  ).map((row) =>
    row.getAttribute('role') === 'separator' ? '---' : row.textContent,
  );

export const SummaryColumnMenu: Story = {
  decorators: [PermissionFlagsDecorator],
  parameters: { permissionFlags: [PermissionFlagType.VIEWS] },
  beforeEach: () => {
    const previousWorkspace = jotaiStore.get(currentWorkspaceState.atom);
    jotaiStore.set(currentWorkspaceState.atom, {
      ...mockCurrentWorkspace,
      featureFlags: [
        { key: FeatureFlagKey.IS_LOOKUP_COLUMNS_ENABLED, value: true },
      ],
    });

    return () => jotaiStore.set(currentWorkspaceState.atom, previousWorkspace);
  },
  render: () => (
    <RecordFieldColumnsProvider>
      <CompanyTable />
    </RecordFieldColumnsProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await canvas.findByRole('button', {
      name: 'Domain Name',
      expanded: false,
    });

    const recordFieldsState = currentRecordFieldsComponentState.atomFamily({
      instanceId: RECORD_INDEX_ID,
    });
    const [, secondRecordField, thirdRecordField] = jotaiStore
      .get(recordFieldsState)
      .filter(({ isVisible }) => isVisible)
      .toSorted(sortByProperty('position'));
    const companyObjectMetadataItem =
      getMockObjectMetadataItemOrThrow('company');
    const peopleFieldMetadataItem = getMockFieldMetadataItemOrThrow({
      objectMetadataItem: companyObjectMetadataItem,
      fieldName: 'people',
    });
    const regularColumnLabel = companyObjectMetadataItem.fields.find(
      ({ id }) => id === thirdRecordField.fieldMetadataItemId,
    )?.label;

    await act(async () => {
      jotaiStore.set(recordFieldsState, [
        ...jotaiStore.get(recordFieldsState),
        {
          id: 'people-summary-column',
          fieldMetadataItemId: peopleFieldMetadataItem.id,
          position:
            (secondRecordField.position + thirdRecordField.position) / 2,
          isVisible: true,
          isCanonical: false,
          size: 150,
          relationScope: {
            filters: [],
            filterGroups: [],
            sorts: [],
            aggregateOperation: AggregateOperations.COUNT,
          },
        },
      ]);
    });

    await userEvent.click(
      await canvas.findByRole('button', {
        name: /^People · /,
        expanded: false,
      }),
    );
    const summaryColumnMenu = await body.findByRole('menu');
    expect(getMenuRows(summaryColumnMenu)).toEqual([
      'Edit summary column…',
      'Delete summary column',
      '---',
      'Move left',
      'Move right',
    ]);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(summaryColumnMenu).not.toBeInTheDocument());

    await userEvent.click(
      canvas.getByRole('button', { name: regularColumnLabel, expanded: false }),
    );
    const regularColumnMenu = await body.findByRole('menu');
    expect(getMenuRows(regularColumnMenu)).toEqual([
      'Filter',
      'Sort',
      '---',
      'Move left',
      'Move right',
      'Hide',
    ]);
    await userEvent.keyboard('{Escape}');
  },
};
