import { render, screen } from '@testing-library/react';

import { HeadlessFrontComponentRendererEngineCommand } from '@/command-menu-item/engine-command/components/HeadlessFrontComponentRendererEngineCommand';
import { CommandComponentInstanceContext } from '@/command-menu-item/engine-command/states/contexts/CommandComponentInstanceContext';
import { type HeadlessFrontComponentCommandContextApi } from '@/command-menu-item/engine-command/types/HeadlessCommandContextApi';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

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
    objectNameSingular,
  }: {
    frontComponentId: string;
    commandMenuItemId?: string;
    selectedRecordIds?: string[];
    objectNameSingular?: string;
  }) => (
    <div data-testid="front-component">
      {`${frontComponentId}:${commandMenuItemId}:${objectNameSingular ?? 'no object'}:${selectedRecordIds?.join(',') || 'no records'}`}
    </div>
  ),
}));

const renderHeadlessFrontComponentCommand = ({
  objectMetadataItem,
  selectedRecordIds,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem | null;
  selectedRecordIds: string[];
}) => {
  mockHeadlessCommandContextApi = {
    frontComponentId: 'front-component-id',
    objectMetadataItem,
    selectedRecords: selectedRecordIds.map((id) => ({ id })),
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
      'front-component-id:command-menu-item-id:company:record-1,record-2',
    );
  });

  it('hands the component no object when the command has none', async () => {
    renderHeadlessFrontComponentCommand({
      objectMetadataItem: null,
      selectedRecordIds: [],
    });

    expect(await screen.findByTestId('front-component')).toHaveTextContent(
      'front-component-id:command-menu-item-id:no object:no records',
    );
  });
});
