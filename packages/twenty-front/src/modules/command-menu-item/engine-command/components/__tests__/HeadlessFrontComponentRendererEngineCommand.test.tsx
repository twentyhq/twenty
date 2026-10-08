import { render, screen } from '@testing-library/react';

import { HeadlessFrontComponentRendererEngineCommand } from '@/command-menu-item/engine-command/components/HeadlessFrontComponentRendererEngineCommand';
import { CommandComponentInstanceContext } from '@/command-menu-item/engine-command/states/contexts/CommandComponentInstanceContext';
import { type HeadlessFrontComponentCommandContextApi } from '@/command-menu-item/engine-command/types/HeadlessCommandContextApi';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';

let mockHeadlessCommandContextApi: HeadlessFrontComponentCommandContextApi;

jest.mock(
  '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi',
  () => ({
    useHeadlessCommandContextApi: () => mockHeadlessCommandContextApi,
  }),
);

jest.mock('@/front-components/components/FrontComponentRenderer', () => ({
  FrontComponentRenderer: ({
    frontComponentId,
    commandMenuItemId,
    selectedRecordIds,
    selectedRecordsFilter,
    objectNameSingular,
  }: {
    frontComponentId: string;
    commandMenuItemId?: string;
    selectedRecordIds?: string[];
    selectedRecordsFilter?: RecordGqlOperationFilter | null;
    objectNameSingular?: string;
  }) => (
    <div data-testid="front-component">
      {`${frontComponentId}:${commandMenuItemId}:${objectNameSingular ?? 'no object'}:${selectedRecordIds?.join(',') || 'no records'}:${JSON.stringify(selectedRecordsFilter ?? null)}`}
    </div>
  ),
}));

const renderHeadlessFrontComponentCommand = ({
  objectMetadataItem,
  selectedRecordIds,
  graphqlFilter = null,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem | null;
  selectedRecordIds: string[];
  graphqlFilter?: RecordGqlOperationFilter | null;
}) => {
  mockHeadlessCommandContextApi = {
    frontComponentId: 'front-component-id',
    objectMetadataItem,
    selectedRecords: selectedRecordIds.map((id) => ({ id })),
    graphqlFilter,
  } as HeadlessFrontComponentCommandContextApi;

  render(
    <CommandComponentInstanceContext.Provider
      value={{ instanceId: 'command-menu-item-id' }}
    >
      <HeadlessFrontComponentRendererEngineCommand />
    </CommandComponentInstanceContext.Provider>,
  );
};

describe('HeadlessFrontComponentRendererEngineCommand', () => {
  it('hands the component every selected record and their object', async () => {
    renderHeadlessFrontComponentCommand({
      objectMetadataItem: {
        nameSingular: 'company',
      } as EnrichedObjectMetadataItem,
      selectedRecordIds: ['record-1', 'record-2'],
    });

    expect(await screen.findByTestId('front-component')).toHaveTextContent(
      'front-component-id:command-menu-item-id:company:record-1,record-2:null',
    );
  });

  it('hands the component no object when the command has none', async () => {
    renderHeadlessFrontComponentCommand({
      objectMetadataItem: null,
      selectedRecordIds: [],
    });

    expect(await screen.findByTestId('front-component')).toHaveTextContent(
      'front-component-id:command-menu-item-id:no object:no records:null',
    );
  });

  it('hands the component the filter matching a Select all selection', async () => {
    const selectAllFilter: RecordGqlOperationFilter = {
      and: [
        { name: { ilike: '%acme%' } },
        { not: { id: { in: ['record-3'] } } },
      ],
    };

    renderHeadlessFrontComponentCommand({
      objectMetadataItem: {
        nameSingular: 'company',
      } as EnrichedObjectMetadataItem,
      selectedRecordIds: [],
      graphqlFilter: selectAllFilter,
    });

    expect(await screen.findByTestId('front-component')).toHaveTextContent(
      `front-component-id:command-menu-item-id:company:no records:${JSON.stringify(selectAllFilter)}`,
    );
  });
});
