import { OnDemandCollectionFieldStory } from '@/object-record/record-field/on-demand/testing/OnDemandCollectionFieldStory';
import {
  ON_DEMAND_FIELD_STORY_RESPONSE,
  ON_DEMAND_FIELD_STORY_TRANSCRIPT_TEXT,
} from '@/object-record/record-field/on-demand/testing/onDemandFieldStoryResponse';
import {
  ON_DEMAND_FIELD_STORY_RECORD_FIELDS,
  seedOnDemandCollectionFieldStory,
} from '@/object-record/record-field/on-demand/testing/seedOnDemandCollectionFieldStory';
import {
  ON_DEMAND_FIELD_STORY_RECORD_ID,
  ON_DEMAND_FIELD_STORY_EDITABLE_OBJECT_METADATA,
} from '@/object-record/record-field/on-demand/testing/seedOnDemandFieldStory';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { delay, graphql, HttpResponse } from 'msw';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { CatalogDecorator, type CatalogStory } from 'twenty-ui/testing';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { generateMockRecordNode } from '~/testing/utils/generateMockRecordNode';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';

const requestValue = fn();
const persistValue = fn();
const delayedValueHandler = graphql.query('FindOneCallRecording', async () => {
  requestValue();
  await delay(300);
  return HttpResponse.json(ON_DEMAND_FIELD_STORY_RESPONSE);
});
const persistValueHandler = graphql.mutation(
  'UpdateOneCallRecording',
  ({ variables }) => {
    persistValue(variables.input);
    return HttpResponse.json({
      data: {
        updateCallRecording: {
          ...generateMockRecordNode({
            objectNameSingular: 'workflowRun',
            input: {
              ...ON_DEMAND_FIELD_STORY_RESPONSE.data.callRecording,
              ...variables.input,
            },
            withDepthOneRelation: true,
            computeReferences: false,
          }),
          __typename: 'CallRecording',
          transcript: variables.input.transcript,
        },
      },
    });
  },
);

const meta: Meta<typeof OnDemandCollectionFieldStory> = {
  title: 'Modules/ObjectRecord/RecordField/OnDemandEditableCollectionField',
  component: OnDemandCollectionFieldStory,
  decorators: [MemoryRouterDecorator, ToastDecorator],
  args: { surface: 'table', isEditable: true },
  beforeEach: () => {
    requestValue.mockClear();
    persistValue.mockClear();
    seedOnDemandCollectionFieldStory({ isEditable: true });
  },
  parameters: { msw: { handlers: [delayedValueHandler, persistValueHandler] } },
};

export default meta;
type Story = StoryObj<typeof OnDemandCollectionFieldStory>;

export const Catalog: CatalogStory<Story, typeof OnDemandCollectionFieldStory> =
  {
    decorators: [CatalogDecorator],
    parameters: {
      catalog: {
        dimensions: [
          {
            name: 'surface',
            values: ['table', 'board', 'calendar'],
            props: (surface: 'table' | 'board' | 'calendar') => ({ surface }),
          },
        ],
      },
    },
    play: async ({ canvasElement }) => {
      expect(
        await within(canvasElement).findAllByRole('button', {
          name: 'View value',
        }),
      ).toHaveLength(3);
      expect(requestValue).not.toHaveBeenCalled();
    },
  };

export const TableLoadsBeforeExistingEditor: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      await canvas.findByRole('button', { name: 'View value' }),
    );
    expect(
      await body.findByRole('status', { name: 'Loading value…' }),
    ).toBeVisible();
    expect(
      body.queryByRole('button', { name: 'Edit JSON' }),
    ).not.toBeInTheDocument();
    expect(
      await body.findByRole('button', { name: 'Edit JSON' }),
    ).toBeVisible();
    expect(body.getByText(ON_DEMAND_FIELD_STORY_TRANSCRIPT_TEXT)).toBeVisible();
    expect(body.queryByRole('dialog')).not.toBeInTheDocument();
    expect(persistValue).not.toHaveBeenCalled();
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(
        body.queryByRole('button', { name: 'Edit JSON' }),
      ).not.toBeInTheDocument(),
    );
    expect(persistValue).not.toHaveBeenCalled();
  },
};

export const BoardLoadsBeforeExistingEditor: Story = {
  args: { surface: 'board' },
  play: TableLoadsBeforeExistingEditor.play,
};

export const CalendarLoadsBeforeExistingEditor: Story = {
  args: { surface: 'calendar' },
  play: TableLoadsBeforeExistingEditor.play,
};

export const ListRemainsReadonlyForEditableJson: Story = {
  args: { surface: 'list' },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      await within(canvasElement).findByRole('button', { name: 'View value' }),
    );
    expect(
      await body.findByText(ON_DEMAND_FIELD_STORY_TRANSCRIPT_TEXT),
    ).toBeVisible();
    expect(
      body.queryByRole('button', { name: 'Edit JSON' }),
    ).not.toBeInTheDocument();
    expect(persistValue).not.toHaveBeenCalled();
  },
};

export const FailedLoadNeverInitializesEditor: Story = {
  parameters: {
    msw: {
      handlers: [
        graphql.query('FindOneCallRecording', () =>
          HttpResponse.json({ errors: [{ message: 'Unavailable' }] }),
        ),
        persistValueHandler,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      await within(canvasElement).findByRole('button', { name: 'View value' }),
    );
    expect(await body.findByRole('alert')).toHaveTextContent(
      'Could not load this value.',
    );
    await userEvent.keyboard('{Escape}');
    expect(
      body.queryByRole('button', { name: 'Edit JSON' }),
    ).not.toBeInTheDocument();
    expect(persistValue).not.toHaveBeenCalled();
  },
};

export const LocalEditWinsOverLateRead: Story = {
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      await within(canvasElement).findByRole('button', { name: 'View value' }),
    );
    await body.findByRole('status', { name: 'Loading value…' });
    const recordAtom = recordStoreFamilyState.atomFamily(
      ON_DEMAND_FIELD_STORY_RECORD_ID,
    );
    jotaiStore.set(recordAtom, {
      ...jotaiStore.get(recordAtom),
      id: ON_DEMAND_FIELD_STORY_RECORD_ID,
      __typename: 'CallRecording',
      transcript: { text: 'Newer local JSON' },
    });
    expect(await body.findByRole('alert')).toHaveTextContent(
      'Could not load this value.',
    );
    expect(jotaiStore.get(recordAtom)?.transcript).toEqual({
      text: 'Newer local JSON',
    });
    expect(
      body.queryByRole('button', { name: 'Edit JSON' }),
    ).not.toBeInTheDocument();
    expect(persistValue).not.toHaveBeenCalled();
  },
};

export const ReorderedCellCannotOpenAnotherEditor: Story = {
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      await within(canvasElement).findByRole('button', { name: 'View value' }),
    );
    await body.findByRole('status', { name: 'Loading value…' });
    jotaiStore.set(
      currentRecordFieldsComponentState.atomFamily({
        instanceId: 'on-demand-story',
      }),
      ON_DEMAND_FIELD_STORY_RECORD_FIELDS.map((field) => ({
        ...field,
        position: field.position === 0 ? 0 : 3 - field.position,
      })),
    );
    await waitFor(() =>
      expect(
        jotaiStore.get(
          recordStoreFamilyState.atomFamily(ON_DEMAND_FIELD_STORY_RECORD_ID),
        )?.transcript,
      ).toEqual({ text: ON_DEMAND_FIELD_STORY_TRANSCRIPT_TEXT }),
    );
    expect(
      body.queryByRole('button', { name: 'Edit JSON' }),
    ).not.toBeInTheDocument();
    expect(body.queryByRole('dialog')).not.toBeInTheDocument();
    expect(persistValue).not.toHaveBeenCalled();
  },
};

export const ObjectBecomingReadonlyDoesNotOpenEditor: Story = {
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      await within(canvasElement).findByRole('button', { name: 'View value' }),
    );
    await body.findByRole('status', { name: 'Loading value…' });
    setTestObjectMetadataItemsInMetadataStore(
      jotaiStore,
      getTestEnrichedObjectMetadataItemsMock().map((objectMetadataItem) =>
        objectMetadataItem.id ===
        ON_DEMAND_FIELD_STORY_EDITABLE_OBJECT_METADATA.id
          ? {
              ...ON_DEMAND_FIELD_STORY_EDITABLE_OBJECT_METADATA,
              isUIEditable: false,
            }
          : objectMetadataItem,
      ),
    );
    expect(
      await body.findByText(ON_DEMAND_FIELD_STORY_TRANSCRIPT_TEXT),
    ).toBeVisible();
    expect(
      body.queryByRole('button', { name: 'Edit JSON' }),
    ).not.toBeInTheDocument();
    expect(persistValue).not.toHaveBeenCalled();
  },
};
