import { RecordCreationFormProvider } from '@/object-record/record-form/components/RecordCreationFormProvider';
import { useRecordCreationFormContextOrThrow } from '@/object-record/record-form/contexts/RecordCreationFormContext';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { recordCreationFormDraftComponentState } from '@/side-panel/pages/record-creation-form/states/recordCreationFormDraftComponentState';
import { recordCreationFormRequestComponentState } from '@/side-panel/pages/record-creation-form/states/recordCreationFormRequestComponentState';
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

const pushSidePanelPages = (store: ReturnType<typeof createStore>) =>
  mockNavigateSidePanelMenu.mockImplementation(
    (page: SidePanelNavigationStackItem) => {
      store.set(isSidePanelOpenedState.atom, true);
      store.set(sidePanelNavigationStackState.atom, [
        ...store.get(sidePanelNavigationStackState.atom),
        page,
      ]);
    },
  );

it('replaces an untouched creation form with the new one', async () => {
  const { result, store } = setup();
  pushSidePanelPages(store);

  let companyCreation: Promise<ObjectRecord | null> | undefined;
  act(() => {
    companyCreation = result.current.requestRecordCreation({
      objectMetadataItem: getMockObjectMetadataItemOrThrow('company'),
      createRecord: jest.fn(),
    });
  });
  act(() => {
    void result.current.requestRecordCreation({
      objectMetadataItem: getMockObjectMetadataItemOrThrow('person'),
      createRecord: jest.fn(),
    });
  });

  const sidePanelPages = store.get(sidePanelNavigationStackState.atom);

  expect(sidePanelPages).toHaveLength(1);
  expect(
    store.get(
      recordCreationFormRequestComponentState.atomFamily({
        instanceId: sidePanelPages[0].pageId,
      }),
    )?.objectMetadataId,
  ).toBe(getMockObjectMetadataItemOrThrow('person').id);
  await act(async () => {
    await expect(companyCreation).resolves.toBeNull();
  });
});

it('keeps an edited creation form of the same object instead of opening another', async () => {
  const { result, store } = setup();
  pushSidePanelPages(store);

  act(() => {
    void result.current.requestRecordCreation({
      objectMetadataItem: getMockObjectMetadataItemOrThrow('company'),
      createRecord: jest.fn(),
    });
  });
  const [formPage] = store.get(sidePanelNavigationStackState.atom);
  act(() => {
    store.set(
      recordCreationFormDraftComponentState.atomFamily({
        instanceId: formPage.pageId,
      }),
      { name: 'Acme' },
    );
  });

  let secondCompanyCreation: Promise<ObjectRecord | null> | undefined;
  act(() => {
    secondCompanyCreation = result.current.requestRecordCreation({
      objectMetadataItem: getMockObjectMetadataItemOrThrow('company'),
      createRecord: jest.fn(),
    });
  });

  expect(store.get(sidePanelNavigationStackState.atom)).toEqual([formPage]);
  await expect(secondCompanyCreation).resolves.toBeNull();
});

it('stacks a new form over an edited creation form of another object', () => {
  const { result, store } = setup();
  pushSidePanelPages(store);

  act(() => {
    void result.current.requestRecordCreation({
      objectMetadataItem: getMockObjectMetadataItemOrThrow('company'),
      createRecord: jest.fn(),
    });
  });
  const [formPage] = store.get(sidePanelNavigationStackState.atom);
  act(() => {
    store.set(
      recordCreationFormDraftComponentState.atomFamily({
        instanceId: formPage.pageId,
      }),
      { name: 'Acme' },
    );
  });
  act(() => {
    void result.current.requestRecordCreation({
      objectMetadataItem: getMockObjectMetadataItemOrThrow('person'),
      createRecord: jest.fn(),
    });
  });

  const sidePanelPages = store.get(sidePanelNavigationStackState.atom);

  expect(sidePanelPages).toHaveLength(2);
  expect(sidePanelPages[0]).toEqual(formPage);
});
