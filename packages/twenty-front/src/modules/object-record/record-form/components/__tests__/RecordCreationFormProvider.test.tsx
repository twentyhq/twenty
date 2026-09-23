import { RecordCreationFormProvider } from '@/object-record/record-form/components/RecordCreationFormProvider';
import { useRecordCreationFormContextOrThrow } from '@/object-record/record-form/contexts/RecordCreationFormContext';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import {
  sidePanelNavigationStackState,
  type SidePanelNavigationStackItem,
} from '@/side-panel/states/sidePanelNavigationStackState';
import { act, renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const mockNavigateSidePanelMenu = jest.fn();
const mockGoBackFromSidePanel = jest.fn();
const mockEnqueueToast = jest.fn();

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({
    navigateSidePanelMenu: mockNavigateSidePanelMenu,
  }),
}));
jest.mock('@/side-panel/hooks/useSidePanelHistory', () => ({
  useSidePanelHistory: () => ({ goBackFromSidePanel: mockGoBackFromSidePanel }),
}));
jest.mock('twenty-ui/primitives/feedback', () => ({
  useToast: () => ({ enqueueToast: mockEnqueueToast }),
}));
jest.mock('@/error-handler/utils/getToastOptionsFromError', () => ({
  getToastOptionsFromError: ({ error }: { error: Error }) => ({
    variant: 'error',
    children: error.message,
  }),
}));

const setup = () => {
  const store = createStore();
  mockNavigateSidePanelMenu.mockImplementation(
    (page: SidePanelNavigationStackItem) => {
      store.set(isSidePanelOpenedState.atom, true);
      store.set(sidePanelNavigationStackState.atom, [page]);
    },
  );
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>
      <RecordCreationFormProvider>{children}</RecordCreationFormProvider>
    </Provider>
  );
  return {
    ...renderHook(useRecordCreationFormContextOrThrow, { wrapper }),
    store,
  };
};

beforeEach(() => jest.clearAllMocks());

it('keeps a rejected creation open, reports the error, and resolves only after a successful retry', async () => {
  const { result, store } = setup();
  const createdRecord = {
    id: 'created-company',
    __typename: 'Company',
    name: 'Test',
  };
  const createRecord = jest
    .fn()
    .mockRejectedValueOnce(new Error('Invalid URL'))
    .mockResolvedValueOnce(createdRecord);
  let creation: Promise<ObjectRecord | null> | undefined;
  act(() => {
    creation = result.current.requestRecordCreation({
      objectMetadataItem: getMockObjectMetadataItemOrThrow('company'),
      createRecord,
      initialDraftRecord: { name: 'Test' },
    });
  });
  const requestId = store.get(sidePanelNavigationStackState.atom)[0].pageId;
  const resolved = jest.fn();
  void creation?.then(resolved);

  await act(async () => {
    await result.current.settleRecordCreationDraft({
      requestId,
      draftRecord: { name: 'Test', domainName: { primaryLinkUrl: 'test' } },
    });
  });

  expect(mockGoBackFromSidePanel).not.toHaveBeenCalled();
  expect(mockNavigateSidePanelMenu).toHaveBeenCalledTimes(1);
  expect(mockEnqueueToast).toHaveBeenCalledWith({
    variant: 'error',
    children: 'Invalid URL',
  });
  expect(resolved).not.toHaveBeenCalled();

  const correctedDraft = {
    name: 'Test',
    domainName: { primaryLinkUrl: 'https://example.com' },
  };
  await act(async () => {
    await result.current.settleRecordCreationDraft({
      requestId,
      draftRecord: correctedDraft,
    });
  });

  expect(createRecord).toHaveBeenLastCalledWith(correctedDraft);
  expect(mockGoBackFromSidePanel).toHaveBeenCalledTimes(1);
  expect(resolved).toHaveBeenCalledWith(createdRecord);
});

it('removes the form from deeper in the history when the user moved on before creation finished', async () => {
  const { result, store } = setup();
  let completeCreation: (record: ObjectRecord) => void = () => {};
  const createRecord = jest.fn(
    () =>
      new Promise<ObjectRecord>((resolve) => {
        completeCreation = resolve;
      }),
  );
  act(() => {
    void result.current.requestRecordCreation({
      objectMetadataItem: getMockObjectMetadataItemOrThrow('company'),
      createRecord,
    });
  });
  const [formPage] = store.get(sidePanelNavigationStackState.atom);
  let submission: Promise<void> | undefined;
  act(() => {
    submission = result.current.settleRecordCreationDraft({
      requestId: formPage.pageId,
      draftRecord: { name: 'Test' },
    });
  });
  await act(async () => {
    await result.current.settleRecordCreationDraft({
      requestId: formPage.pageId,
      draftRecord: { name: 'Test' },
    });
  });
  expect(createRecord).toHaveBeenCalledTimes(1);

  const otherPage = { ...formPage, pageId: 'other-page' };
  act(() => {
    store.set(sidePanelNavigationStackState.atom, [formPage, otherPage]);
  });
  await act(async () => {
    completeCreation({ id: 'created-company', __typename: 'Company' });
    await submission;
  });

  expect(mockGoBackFromSidePanel).not.toHaveBeenCalled();
  expect(store.get(sidePanelNavigationStackState.atom)).toEqual([otherPage]);
});
