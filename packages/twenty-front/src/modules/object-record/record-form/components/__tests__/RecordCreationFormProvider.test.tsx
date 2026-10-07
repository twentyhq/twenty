import { RecordCreationFormProvider } from '@/object-record/record-form/components/RecordCreationFormProvider';
import { useRecordCreationFormContextOrThrow } from '@/object-record/record-form/contexts/RecordCreationFormContext';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import {
  sidePanelNavigationStackState,
  type SidePanelNavigationStackItem,
} from '@/side-panel/states/sidePanelNavigationStackState';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { act, renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const mockNavigateSidePanelMenu = jest.fn();
const mockCloseSidePanelMenu = jest.fn();

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({
    navigateSidePanelMenu: mockNavigateSidePanelMenu,
    closeSidePanelMenu: mockCloseSidePanelMenu,
  }),
}));
jest.mock('twenty-ui/components/feedback', () => ({
  ...jest.requireActual('twenty-ui/components/feedback'),
  useToast: () => ({ enqueueToast: jest.fn() }),
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
  let submission: Promise<unknown> | undefined;
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

  expect(mockCloseSidePanelMenu).not.toHaveBeenCalled();
  expect(store.get(sidePanelNavigationStackState.atom)).toEqual([otherPage]);
});

it('resolves with the error the server rejected the draft with and keeps the form open', async () => {
  const { result, store } = setup();
  const rejection = new CombinedGraphQLErrors({
    data: null,
    errors: [
      {
        message: 'A company needs an amount',
        extensions: {
          subCode: 'VALIDATION_RULE_VIOLATION',
          validationRuleViolations: [
            { ruleId: 'amount-rule', fieldMetadataId: 'field-amount' },
          ],
        },
      },
    ],
  });
  const createRecord = jest.fn(() => Promise.reject(rejection));
  act(() => {
    void result.current.requestRecordCreation({
      objectMetadataItem: getMockObjectMetadataItemOrThrow('company'),
      createRecord,
    });
  });
  const [formPage] = store.get(sidePanelNavigationStackState.atom);

  let settlement: unknown;
  await act(async () => {
    settlement = await result.current.settleRecordCreationDraft({
      requestId: formPage.pageId,
      draftRecord: { name: 'Test' },
    });
  });

  expect(createRecord).toHaveBeenCalledTimes(1);
  expect(createRecord).toHaveBeenCalledWith({ name: 'Test' });
  expect(settlement).toEqual({ error: rejection });
  expect(store.get(sidePanelNavigationStackState.atom)).toEqual([formPage]);
});
