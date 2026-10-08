import { render, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';

import { RestoreRecordsCommand } from '@/command-menu-item/engine-command/record/components/RestoreRecordsCommand';
import { CommandComponentInstanceContext } from '@/command-menu-item/engine-command/states/contexts/CommandComponentInstanceContext';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const mockPersonObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');
const mockRestoreManyRecords = jest.fn();
const mockOpenConfirmationModal = jest.fn();

let mockObjectMetadataItem: EnrichedObjectMetadataItem =
  mockPersonObjectMetadataItem;

jest.mock(
  '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi',
  () => ({
    useHeadlessCommandContextApi: () => ({
      objectMetadataItem: mockObjectMetadataItem,
      selectedRecords: [{ id: 'record-1' }],
      graphqlFilter: { id: { in: ['record-1'] } },
    }),
  }),
);

jest.mock('@/object-record/hooks/useLazyFetchAllRecords', () => ({
  useLazyFetchAllRecords: () => ({
    fetchAllRecords: async () => [{ id: 'record-1' }],
  }),
}));

jest.mock('@/object-record/hooks/useRestoreManyRecords', () => ({
  useRestoreManyRecords: () => ({
    restoreManyRecords: mockRestoreManyRecords,
  }),
}));

jest.mock(
  '@/command-menu-item/confirmation-modal/hooks/useCommandMenuConfirmationModal',
  () => ({
    useCommandMenuConfirmationModal: () => ({
      openConfirmationModal: mockOpenConfirmationModal,
    }),
  }),
);

const renderCommand = () => {
  const Wrapper = getJestMetadataAndApolloMocksWrapper({ apolloMocks: [] });

  return render(<RestoreRecordsCommand />, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <Wrapper>
        <CommandComponentInstanceContext.Provider
          value={{ instanceId: 'restore-records-command' }}
        >
          {children}
        </CommandComponentInstanceContext.Provider>
      </Wrapper>
    ),
  });
};

beforeEach(() => {
  jest.clearAllMocks();
  mockObjectMetadataItem = mockPersonObjectMetadataItem;
});

it('asks for confirmation before restoring records', async () => {
  renderCommand();

  await waitFor(() =>
    expect(mockOpenConfirmationModal).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Restore Person' }),
    ),
  );
  expect(mockOpenConfirmationModal).toHaveBeenCalledTimes(1);
  expect(mockRestoreManyRecords).not.toHaveBeenCalled();
});

it('restores a chat right away without asking for confirmation', async () => {
  mockObjectMetadataItem = {
    ...mockPersonObjectMetadataItem,
    nameSingular: CoreObjectNameSingular.AgentChatThread,
  };

  renderCommand();

  await waitFor(() =>
    expect(mockRestoreManyRecords).toHaveBeenCalledWith({
      idsToRestore: ['record-1'],
    }),
  );
  expect(mockRestoreManyRecords).toHaveBeenCalledTimes(1);
  expect(mockOpenConfirmationModal).not.toHaveBeenCalled();
});
