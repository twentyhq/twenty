import { OnDemandCollectionQueryStory } from '@/object-record/record-field/on-demand/testing/OnDemandCollectionQueryStory';
import {
  ON_DEMAND_FIELD_STORY_RESPONSE,
  ON_DEMAND_FIELD_STORY_TRANSCRIPT_TEXT,
} from '@/object-record/record-field/on-demand/testing/onDemandFieldStoryResponse';
import { seedOnDemandCollectionQueryStory } from '@/object-record/record-field/on-demand/testing/seedOnDemandCollectionQueryStory';
import { ON_DEMAND_FIELD_STORY_RECORD_ID } from '@/object-record/record-field/on-demand/testing/seedOnDemandFieldStory';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { parse } from 'graphql';
import { graphql, HttpResponse } from 'msw';
import { expect, userEvent, within } from 'storybook/test';
import { CatalogDecorator, type CatalogStory } from 'twenty-ui/testing';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { mockedWorkspaceMemberRecords } from '~/testing/mock-data/generated/data/workspaceMembers/mock-workspaceMembers-data';

let collectionRequests: { selectedFields: string[]; filter: unknown }[] = [];
let fieldRequests: { selectedFields: string[]; recordId: string }[] = [];

const getSelectedFieldNames = ({
  query,
  fieldPath,
}: {
  query: string;
  fieldPath: string[];
}) => {
  const operation = parse(query).definitions.find(
    (definition) => definition.kind === 'OperationDefinition',
  );
  let selectionSet = operation?.selectionSet;

  for (const fieldName of fieldPath) {
    const field = selectionSet?.selections.find(
      (selection) =>
        selection.kind === 'Field' && selection.name.value === fieldName,
    );
    selectionSet = field?.kind === 'Field' ? field.selectionSet : undefined;
  }

  return (
    selectionSet?.selections.flatMap((selection) =>
      selection.kind === 'Field' ? [selection.name.value] : [],
    ) ?? []
  );
};

const meta: Meta<typeof OnDemandCollectionQueryStory> = {
  title: 'Modules/ObjectRecord/RecordTable/OnDemandCollectionQuery',
  component: OnDemandCollectionQueryStory,
  decorators: [MemoryRouterDecorator, ToastDecorator],
  beforeEach: async () => {
    collectionRequests = [];
    fieldRequests = [];
    await seedOnDemandCollectionQueryStory();
    expect(
      jotaiStore.get(
        recordStoreFamilyState.atomFamily(ON_DEMAND_FIELD_STORY_RECORD_ID),
      ),
    ).toBeNull();
  },
  parameters: {
    msw: {
      handlers: [
        graphql.query('FindManyCallRecordings', ({ query, variables }) => {
          const selectedFields = getSelectedFieldNames({
            query,
            fieldPath: ['callRecordings', 'edges', 'node'],
          });
          collectionRequests.push({
            selectedFields,
            filter: variables.filter,
          });
          const { transcript, ...record } =
            ON_DEMAND_FIELD_STORY_RESPONSE.data.callRecording;

          return HttpResponse.json({
            data: {
              callRecordings: {
                edges: [
                  {
                    node: {
                      ...record,
                      name: 'Customer call',
                      status: null,
                      position: 1,
                      createdAt: record.updatedAt,
                      deletedAt: null,
                      ...(selectedFields.includes('transcript')
                        ? { transcript }
                        : {}),
                    },
                    cursor: ON_DEMAND_FIELD_STORY_RECORD_ID,
                  },
                ],
                pageInfo: {
                  hasNextPage: false,
                  hasPreviousPage: false,
                  startCursor: ON_DEMAND_FIELD_STORY_RECORD_ID,
                  endCursor: ON_DEMAND_FIELD_STORY_RECORD_ID,
                },
                totalCount: 1,
              },
            },
          });
        }),
        graphql.query('FindOneCallRecording', ({ query, variables }) => {
          fieldRequests.push({
            selectedFields: getSelectedFieldNames({
              query,
              fieldPath: ['callRecording'],
            }),
            recordId: variables.objectRecordId,
          });
          return HttpResponse.json(ON_DEMAND_FIELD_STORY_RESPONSE);
        }),
        graphql.query('FindOneWorkspaceMember', ({ variables }) =>
          HttpResponse.json({
            data: {
              workspaceMember:
                mockedWorkspaceMemberRecords.find(
                  (workspaceMemberRecord) =>
                    workspaceMemberRecord.id === variables.objectRecordId,
                ) ?? null,
            },
          }),
        ),
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof OnDemandCollectionQueryStory>;

export const Catalog: CatalogStory<Story, typeof OnDemandCollectionQueryStory> =
  {
    decorators: [CatalogDecorator],
    parameters: { catalog: { dimensions: [] } },
    play: async ({ canvasElement }) => {
      const canvas = within(canvasElement);
      const body = within(canvasElement.ownerDocument.body);
      await canvas.findByText('Customer call');
      expect(collectionRequests.length).toBeGreaterThan(0);
      for (const request of collectionRequests) {
        expect(request.selectedFields).not.toContain('transcript');
        expect(request.selectedFields).toEqual(
          expect.arrayContaining(['id', 'name', 'updatedAt']),
        );
      }
      expect(fieldRequests).toHaveLength(0);
      expect(
        canvas.queryByText(ON_DEMAND_FIELD_STORY_TRANSCRIPT_TEXT),
      ).not.toBeInTheDocument();

      await userEvent.click(canvas.getByRole('button', { name: 'View value' }));
      expect(
        await body.findByText(ON_DEMAND_FIELD_STORY_TRANSCRIPT_TEXT),
      ).toBeVisible();
      expect(fieldRequests).toHaveLength(1);
      expect(fieldRequests[0]).toEqual({
        selectedFields: expect.arrayContaining([
          '__typename',
          'id',
          'transcript',
          'updatedAt',
        ]),
        recordId: ON_DEMAND_FIELD_STORY_RECORD_ID,
      });
      expect(fieldRequests[0].selectedFields).toHaveLength(4);
    },
  };

export const FlagDisabledFetchesEagerly: Story = {
  beforeEach: () =>
    seedOnDemandCollectionQueryStory({ isOnDemandFieldsEnabled: false }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Customer call');
    expect(collectionRequests.length).toBeGreaterThan(0);
    for (const request of collectionRequests) {
      expect(request.selectedFields).toContain('transcript');
    }
    expect(
      canvas.queryByRole('button', { name: 'View value' }),
    ).not.toBeInTheDocument();
    expect(fieldRequests).toHaveLength(0);
  },
};

export const FieldSettingDisabledFetchesEagerly: Story = {
  beforeEach: () =>
    seedOnDemandCollectionQueryStory({ isValueLoadedOnOpen: false }),
  play: FlagDisabledFetchesEagerly.play,
};

export const FilterRequiredFieldFetchesEagerly: Story = {
  beforeEach: () => seedOnDemandCollectionQueryStory({ hasJsonFilter: true }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Customer call');
    expect(collectionRequests.length).toBeGreaterThan(0);
    for (const request of collectionRequests) {
      expect(request.selectedFields).toContain('transcript');
      expect(request.filter).toEqual({ transcript: { like: '%customer%' } });
    }
    expect(canvas.getByRole('button', { name: 'View value' })).toBeVisible();
    expect(fieldRequests).toHaveLength(0);
  },
};
