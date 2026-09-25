import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { ExportRecordsCommand } from '@/command-menu-item/engine-command/record/components/ExportRecordsCommand';
import { CommandComponentInstanceContext } from '@/command-menu-item/engine-command/states/contexts/CommandComponentInstanceContext';
import { render, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const mockIndexDownload = jest.fn().mockResolvedValue(undefined);
let mockHasMoreRecords = false;
const mockAsyncDownload = jest.fn().mockResolvedValue(undefined);
const mockCancelAsyncDownload = jest.fn();
const mockSingleRecordDownload = jest.fn().mockResolvedValue(undefined);
const mockObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');
let mockRecordIndexId: string | undefined;

jest.mock(
  '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi',
  () => ({
    useHeadlessCommandContextApi: () => ({
      objectMetadataItem: mockObjectMetadataItem,
      recordIndexId: mockRecordIndexId,
      selectedRecords: [{ id: 'selected-record' }],
    }),
  }),
);
jest.mock(
  '@/object-record/record-index/export/hooks/useRecordIndexAsyncExportRecords',
  () => ({
    useRecordIndexAsyncExportRecords: () => ({
      download: mockAsyncDownload,
      cancel: mockCancelAsyncDownload,
    }),
  }),
);
jest.mock(
  '@/object-record/record-index/export/hooks/useRecordIndexExportRecords',
  () => ({
    useRecordIndexExportRecords: ({
      onMoreRecords,
    }: {
      onMoreRecords: () => Promise<void>;
    }) => ({
      download: async () => {
        await mockIndexDownload();
        if (mockHasMoreRecords) {
          await onMoreRecords();
        }
      },
    }),
  }),
);
jest.mock('@/object-record/record-show/hooks/useExportSingleRecord', () => ({
  useExportSingleRecord: () => ({ download: mockSingleRecordDownload }),
}));

const renderExport = () => {
  const Wrapper = getJestMetadataAndApolloMocksWrapper({
    apolloMocks: [],
    onInitializeJotaiStore: (store) => {
      store.set(currentWorkspaceState.atom, {
        ...mockCurrentWorkspace,
        featureFlags: [],
      });
    },
  });
  return render(<ExportRecordsCommand />, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <Wrapper>
        <CommandComponentInstanceContext.Provider
          value={{ instanceId: 'export-command' }}
        >
          {children}
        </CommandComponentInstanceContext.Provider>
      </Wrapper>
    ),
  });
};

beforeEach(() => {
  jest.useRealTimers();
  jest.clearAllMocks();
  mockRecordIndexId = 'record-index';
  mockHasMoreRecords = false;
});

it('exports a single batch without starting an async export', async () => {
  renderExport();
  await waitFor(() => expect(mockIndexDownload).toHaveBeenCalledTimes(1));
  expect(mockAsyncDownload).not.toHaveBeenCalled();
  expect(mockSingleRecordDownload).not.toHaveBeenCalled();
});

it('exports additional pages asynchronously without workspace feature flags', async () => {
  mockHasMoreRecords = true;
  renderExport();
  await waitFor(() => expect(mockAsyncDownload).toHaveBeenCalledTimes(1));
  expect(mockSingleRecordDownload).not.toHaveBeenCalled();
});

it('keeps single-record export on the show page', async () => {
  mockRecordIndexId = undefined;
  renderExport();
  await waitFor(() =>
    expect(mockSingleRecordDownload).toHaveBeenCalledTimes(1),
  );
  expect(mockAsyncDownload).not.toHaveBeenCalled();
  expect(mockIndexDownload).not.toHaveBeenCalled();
});
