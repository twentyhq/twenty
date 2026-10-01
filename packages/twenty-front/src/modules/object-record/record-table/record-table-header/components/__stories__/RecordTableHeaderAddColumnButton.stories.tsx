import {
  useRecordTableContextOrThrow,
  RecordTableContextProvider,
} from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableHeaderAddColumnButton } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderAddColumnButton';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ContextStoreDecorator } from '~/testing/decorators/ContextStoreDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { RecordTableDecorator } from '~/testing/decorators/RecordTableDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const AddColumnStory = ({
  allFieldsVisible = false,
}: {
  allFieldsVisible?: boolean;
}) => {
  const recordTableContext = useRecordTableContextOrThrow();
  const recordTableId = useAvailableComponentInstanceIdOrThrow(
    RecordTableComponentInstanceContext,
  );
  const visibleRecordFields = allFieldsVisible
    ? recordTableContext.objectMetadataItem.fields.map((field, position) => ({
        id: field.id,
        fieldMetadataItemId: field.id,
        position,
        size: 100,
        isVisible: true,
      }))
    : recordTableContext.visibleRecordFields;

  return (
    <RecordTableContextProvider
      value={{ ...recordTableContext, recordTableId, visibleRecordFields }}
    >
      <RecordTableHeaderAddColumnButton />
    </RecordTableContextProvider>
  );
};

const meta: Meta<typeof AddColumnStory> = {
  title: 'Modules/ObjectRecord/RecordTable/RecordTableHeaderAddColumnButton',
  component: AddColumnStory,
  decorators: [
    ComponentDecorator,
    MemoryRouterDecorator,
    RecordTableDecorator,
    ContextStoreDecorator,
    ToastDecorator,
    ObjectMetadataItemsDecorator,
  ],
  parameters: {
    recordTableObjectNameSingular: 'company',
    msw: {
      handlers: [
        graphql.mutation('CreateManyViewFields', ({ variables }) =>
          HttpResponse.json({
            data: {
              createManyViewFields: variables.inputs.map(
                (input: Record<string, unknown>) => ({
                  ...input,
                  __typename: 'ViewField',
                  isActive: true,
                }),
              ),
            },
          }),
        ),
        ...graphqlMocks.handlers,
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof AddColumnStory>;

export const SearchAndAddColumn: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await canvas.findByRole('button', { name: 'Add column' });
    await userEvent.click(trigger);
    const popup = await body.findByRole('dialog', { name: 'Add column' });
    const search = within(popup).getByPlaceholderText('Search fields');
    const firstField = within(popup).getAllByRole('button')[0];
    const fieldLabel = firstField.textContent ?? '';
    await userEvent.type(search, fieldLabel);
    await waitFor(() =>
      expect(search).toHaveAttribute('aria-activedescendant', firstField.id),
    );
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(popup).not.toBeInTheDocument());
    await userEvent.click(trigger);
    const reopenedPopup = await body.findByRole('dialog', {
      name: 'Add column',
    });
    expect(
      within(reopenedPopup).queryByRole('button', {
        name: fieldLabel,
      }),
    ).not.toBeInTheDocument();
    expect(
      within(reopenedPopup).getByPlaceholderText('Search fields'),
    ).toHaveValue('');
    await userEvent.keyboard('{Escape}');
  },
};

export const EmptySearchAndCustomizeFields: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Add column' }),
    );
    const popup = await body.findByRole('dialog', { name: 'Add column' });
    await userEvent.type(
      within(popup).getByPlaceholderText('Search fields'),
      'missing-field',
    );
    expect(within(popup).getByText('No results')).toBeVisible();
    const customizeFields = within(popup).getByRole('link', {
      name: 'Customize fields',
    });
    expect(customizeFields).toHaveAttribute(
      'href',
      '/settings/objects/companies',
    );
    await userEvent.click(customizeFields);
    await waitFor(() => expect(popup).not.toBeInTheDocument());
  },
};

export const AllFieldsVisible: Story = {
  args: { allFieldsVisible: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Add column' }),
    );
    const popup = await body.findByRole('dialog', { name: 'Add column' });
    expect(
      within(popup).getByText('All fields are already visible'),
    ).toBeVisible();
    expect(
      within(popup).queryByPlaceholderText('Search fields'),
    ).not.toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
  },
};
