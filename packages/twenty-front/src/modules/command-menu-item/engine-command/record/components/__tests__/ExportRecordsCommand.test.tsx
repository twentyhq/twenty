import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { ExportRecordsCommand } from '@/command-menu-item/engine-command/record/components/ExportRecordsCommand';
import { CommandComponentInstanceContext } from '@/command-menu-item/engine-command/states/contexts/CommandComponentInstanceContext';
import { render, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const mockSynchronousDownload = jest.fn().mockResolvedValue(undefined);
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
  '@/object-record/record-index/export/hooks/useRecordIndexExportRecords',
  () => ({
    useRecordIndexExportRecords: () => ({
      download: mockSynchronousDownload,
      progress: {},
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
jest.mock('@/object-record/record-show/hooks/useExportSingleRecord', () => ({
  useExportSingleRecord: () => ({ download: mockSingleRecordDownload }),
}));

const renderExport = (enabled?: boolean) => {
  const Wrapper = getJestMetadataAndApolloMocksWrapper({
    apolloMocks: [],
    onInitializeJotaiStore: (store) => {
      store.set(currentWorkspaceState.atom, {
        ...mockCurrentWorkspace,
        featureFlags:
          enabled === undefined
            ? []
            : [
                {
                  key: FeatureFlagKey.IS_ASYNC_CSV_EXPORT_ENABLED,
                  value: enabled,
                },
              ],
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
});

it.each([undefined, false, true])(
  'selects the export path when the workspace flag is %s',
  async (enabled) => {
    renderExport(enabled);
    await waitFor(() =>
      expect(
        enabled ? mockAsyncDownload : mockSynchronousDownload,
      ).toHaveBeenCalledTimes(1),
    );
    expect(
      enabled ? mockSynchronousDownload : mockAsyncDownload,
    ).not.toHaveBeenCalled();
    expect(mockSingleRecordDownload).not.toHaveBeenCalled();
  },
);

it.each([false, true])(
  'keeps single-record export when the workspace flag is %s',
  async (enabled) => {
    mockRecordIndexId = undefined;
    renderExport(enabled);
    await waitFor(() =>
      expect(mockSingleRecordDownload).toHaveBeenCalledTimes(1),
    );
    expect(mockAsyncDownload).not.toHaveBeenCalled();
    expect(mockSynchronousDownload).not.toHaveBeenCalled();
  },
);
