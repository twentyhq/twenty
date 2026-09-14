import { useCreateNewRecord } from '@/object-record/hooks/useCreateNewRecord';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { act, renderHook } from '@testing-library/react';
import { OpenRecordIn } from 'twenty-shared/types';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const mockCreateOneRecord = jest.fn();
const mockRequestRecordCreation = jest.fn();
const mockOpenRecordInSidePanel = jest.fn();
const mockUpsertRecordsInStore = jest.fn();
let mockShouldOpenRecordCreationForm = true;

jest.mock('@/object-record/hooks/useCreateOneRecord', () => ({
  useCreateOneRecord: () => ({ createOneRecord: mockCreateOneRecord }),
}));
jest.mock('@/object-record/hooks/useBuildRecordInputFromRLSPredicates', () => ({
  useBuildRecordInputFromRLSPredicates: () => ({
    buildRecordInputFromRLSPredicates: () => ({ name: 'Permission default' }),
  }),
}));
jest.mock('@/object-record/record-form/hooks/useRecordCreationForm', () => ({
  useRecordCreationForm: () => ({
    shouldOpenRecordCreationForm: mockShouldOpenRecordCreationForm,
    requestRecordCreation: mockRequestRecordCreation,
  }),
}));
jest.mock('@/side-panel/hooks/useOpenRecordInSidePanel', () => ({
  useOpenRecordInSidePanel: () => ({
    openRecordInSidePanel: mockOpenRecordInSidePanel,
  }),
}));
jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({ closeSidePanelMenu: jest.fn() }),
}));
jest.mock('@/ui/layout/hooks/useWorkspaceSurface', () => ({
  useWorkspaceSurface: () => ({ type: 'main' }),
}));
jest.mock('@/object-record/record-index/hooks/useResolveOpenRecordIn', () => ({
  useResolveOpenRecordIn: () => OpenRecordIn.SIDE_PANEL,
}));
jest.mock('@/object-record/record-store/hooks/useUpsertRecordsInStore', () => ({
  useUpsertRecordsInStore: () => ({
    upsertRecordsInStore: mockUpsertRecordsInStore,
  }),
}));
jest.mock('~/hooks/useNavigateApp', () => ({
  useNavigateApp: () => jest.fn(),
}));

const objectMetadataItem = getMockObjectMetadataItemOrThrow('company');

beforeEach(() => {
  jest.clearAllMocks();
  mockShouldOpenRecordCreationForm = true;
  mockCreateOneRecord.mockImplementation(
    async (record: ObjectRecord) => record,
  );
  mockRequestRecordCreation.mockImplementation(
    async ({
      createRecord,
    }: {
      createRecord: (record: Partial<ObjectRecord>) => Promise<ObjectRecord>;
    }) => createRecord({ name: 'Acme' }),
  );
});

it('creates and opens the submitted record without an index context', async () => {
  const { result } = renderHook(() =>
    useCreateNewRecord({ objectMetadataItem }),
  );

  await act(async () => {
    await result.current.createNewRecord();
  });

  expect(mockCreateOneRecord).toHaveBeenCalledWith({
    id: expect.any(String),
    name: 'Acme',
  });
  expect(mockOpenRecordInSidePanel).toHaveBeenCalledWith({
    recordId: expect.any(String),
    objectNameSingular: 'company',
    isNewRecord: false,
  });
  expect(mockUpsertRecordsInStore).toHaveBeenCalledWith({
    partialRecords: [expect.objectContaining({ name: 'Acme' })],
  });
});

it('does not create or navigate when the form is cancelled', async () => {
  mockRequestRecordCreation.mockResolvedValue(null);
  const onRecordCreated = jest.fn();
  const { result } = renderHook(() =>
    useCreateNewRecord({ objectMetadataItem, onRecordCreated }),
  );

  await act(async () => {
    expect(await result.current.createNewRecord()).toBeUndefined();
  });

  expect(mockCreateOneRecord).not.toHaveBeenCalled();
  expect(mockOpenRecordInSidePanel).not.toHaveBeenCalled();
  expect(onRecordCreated).not.toHaveBeenCalled();
});

it('preserves index defaults and notifies the index after form submission', async () => {
  const onRecordCreated = jest.fn();
  const { result } = renderHook(() =>
    useCreateNewRecord({
      objectMetadataItem,
      buildRecordInput: () => ({ name: 'Filter default', employees: 10 }),
      onRecordCreated,
    }),
  );

  await act(async () => {
    await result.current.createNewRecord({ position: 'first' });
  });

  expect(mockCreateOneRecord).toHaveBeenCalledWith({
    id: expect.any(String),
    name: 'Acme',
    employees: 10,
    position: 'first',
  });
  expect(onRecordCreated).toHaveBeenCalledWith(
    expect.objectContaining({ name: 'Acme', employees: 10 }),
    { name: 'Acme', position: 'first' },
  );
});

it('creates directly with permission defaults when no form is available', async () => {
  mockShouldOpenRecordCreationForm = false;
  const { result } = renderHook(() =>
    useCreateNewRecord({ objectMetadataItem }),
  );

  await act(async () => {
    await result.current.createNewRecord();
  });

  expect(mockRequestRecordCreation).not.toHaveBeenCalled();
  expect(mockCreateOneRecord).toHaveBeenCalledWith({
    id: expect.any(String),
    name: 'Permission default',
  });
});
