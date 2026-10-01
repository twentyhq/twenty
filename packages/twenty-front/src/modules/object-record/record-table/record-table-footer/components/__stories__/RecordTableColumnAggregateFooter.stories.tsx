import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { RecordComponentInstanceContextsWrapper } from '@/object-record/components/RecordComponentInstanceContextsWrapper';
import { RecordTableComponentInstance } from '@/object-record/record-table/components/RecordTableComponentInstance';
import { RecordTableContextProvider } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableColumnAggregateFooterCellContext } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterCellContext';
import { RecordTableColumnFooterWithDropdown } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterWithDropdown';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { mockedViews } from '~/testing/mock-data/generated/metadata/views/mock-views-data';
import { setTestViewsInMetadataStore } from '~/testing/utils/setTestViewsInMetadataStore';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const INSTANCE_ID = 'aggregate-footer-story';
const company = getTestEnrichedObjectMetadataItemsMock().find(
  (object) => object.nameSingular === 'company',
)!;
const field = company.fields.find((item) => item.name === 'name')!;
const view = mockedViews.find((item) => item.objectMetadataId === company.id)!;
const viewField = view.viewFields.find(
  (item) => item.fieldMetadataId === field.id,
)!;
let completeUpdate: (() => void) | undefined;
let lastAggregateOperation: unknown;

const AggregateExample = () => {
  const { objectMetadataItems } = useObjectMetadataItems();
  return (
    <ContextStoreComponentInstanceContext.Provider
      value={{ instanceId: INSTANCE_ID }}
    >
      <ViewComponentInstanceContext.Provider
        value={{ instanceId: INSTANCE_ID }}
      >
        <RecordComponentInstanceContextsWrapper
          componentInstanceId={INSTANCE_ID}
        >
          <RecordTableComponentInstance recordTableId={INSTANCE_ID}>
            <RecordTableContextProvider
              value={{
                recordTableId: INSTANCE_ID,
                viewBarId: INSTANCE_ID,
                objectNameSingular: 'company',
                objectMetadataItem: company,
                objectMetadataItems,
                objectPermissions: { objectMetadataId: company.id },
                visibleRecordFields: [],
                triggerEvent: 'CLICK',
              }}
            >
              <RecordTableColumnAggregateFooterCellContext.Provider
                value={{ fieldMetadataId: field.id, viewFieldId: viewField.id }}
              >
                <ScrollWrapper componentInstanceId={INSTANCE_ID} autoHeight>
                  <RecordTableColumnFooterWithDropdown isFirstCell />
                </ScrollWrapper>
              </RecordTableColumnAggregateFooterCellContext.Provider>
            </RecordTableContextProvider>
          </RecordTableComponentInstance>
        </RecordComponentInstanceContextsWrapper>
      </ViewComponentInstanceContext.Provider>
    </ContextStoreComponentInstanceContext.Provider>
  );
};

const meta: Meta = {
  title: 'Modules/RecordTable/AggregateFooter',
  decorators: [
    ObjectMetadataItemsDecorator,
    ToastDecorator,
    ComponentDecorator,
  ],
  render: () => <AggregateExample />,
  beforeEach: () => {
    completeUpdate = undefined;
    lastAggregateOperation = undefined;
    jotaiStore.set(
      contextStoreCurrentViewIdComponentState.atomFamily({
        instanceId: INSTANCE_ID,
      }),
      view.id,
    );
  },
  parameters: {
    msw: {
      handlers: [
        graphql.mutation('UpdateViewField', async ({ variables }) => {
          lastAggregateOperation = variables.input.update.aggregateOperation;
          await new Promise<void>((resolve) => {
            completeUpdate = resolve;
          });
          return HttpResponse.json({
            data: {
              updateViewField: {
                ...viewField,
                isActive: true,
                ...variables.input.update,
                __typename: 'ViewField',
              },
            },
          });
        }),
      ],
    },
  },
};
export default meta;
type Story = StoryObj;

export const NavigateSaveAndRestoreScroll: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await canvas.findByRole('button', { name: 'Calculate' });
    setTestViewsInMetadataStore(jotaiStore, [
      {
        ...view,
        viewFields: view.viewFields.map((viewField) => ({
          ...viewField,
          isActive: true,
        })),
      },
    ]);
    const scroll = canvasElement.querySelector(
      `#scroll-wrapper-${INSTANCE_ID}`,
    );
    await userEvent.click(trigger);
    const popup = await body.findByRole('dialog');
    expect(scroll).not.toHaveClass('scroll-wrapper-y-enabled');
    await userEvent.click(within(popup).getByRole('button', { name: 'Count' }));
    await within(popup).findByRole('button', { name: 'Count all' });
    await userEvent.click(within(popup).getByRole('button', { name: 'Count' }));
    const count = await within(popup).findByRole('button', { name: 'Count' });
    await waitFor(() => expect(count).toHaveFocus());
    await userEvent.keyboard('{Enter}');
    await userEvent.click(
      await within(popup).findByRole('button', { name: 'Count all' }),
    );
    await waitFor(() => expect(completeUpdate).toBeDefined());
    expect(popup).toBeVisible();
    expect(lastAggregateOperation).toBe('COUNT');
    completeUpdate?.();
    await waitFor(() => expect(popup).not.toBeInTheDocument());
    expect(scroll).toHaveClass('scroll-wrapper-y-enabled');
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.click(trigger);
    expect(await body.findByRole('button', { name: 'Percent' })).toBeVisible();
    await userEvent.keyboard('{Escape}');
  },
};
