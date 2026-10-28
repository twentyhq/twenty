import { act, renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useBuildRecordInputFromRLSPredicates } from '@/object-record/hooks/useBuildRecordInputFromRLSPredicates';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useCreateJunctionRecordWithNestedTarget } from '@/object-record/record-field/ui/hooks/useCreateJunctionRecordWithNestedTarget';
import { isUsableJunctionConfig } from '@/object-record/record-field/ui/utils/junction/isUsableJunctionConfig';
import { resolveJunctionConfig } from '@/object-record/record-field/ui/utils/junction/resolveJunctionConfig';
import { RecordCreationFormProvider } from '@/object-record/record-form/components/RecordCreationFormProvider';
import { useRecordCreationFormContextOrThrow } from '@/object-record/record-form/contexts/RecordCreationFormContext';
import { computeRecordFormCreateRecordInput } from '@/object-record/record-form/utils/computeRecordFormCreateRecordInput';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { recordCreationFormRequestComponentState } from '@/side-panel/pages/record-creation-form/states/recordCreationFormRequestComponentState';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import {
  sidePanelNavigationStackState,
  type SidePanelNavigationStackItem,
} from '@/side-panel/states/sidePanelNavigationStackState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

jest.mock('@/object-metadata/hooks/useObjectMetadataItems');
jest.mock('@/object-record/hooks/useBuildRecordInputFromRLSPredicates');
jest.mock('@/object-record/hooks/useCreateOneRecord', () => ({
  useCreateOneRecord: jest.fn(),
}));
jest.mock('@/workspace/hooks/useIsFeatureEnabled');

const mockNavigateSidePanelMenu = jest.fn();
const mockCloseSidePanelMenu = jest.fn();

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({
    navigateSidePanelMenu: mockNavigateSidePanelMenu,
    closeSidePanelMenu: mockCloseSidePanelMenu,
  }),
}));

const mockEnqueueToast = jest.fn();

jest.mock('twenty-ui/components/feedback', () => ({
  useToast: () => ({ enqueueToast: mockEnqueueToast }),
}));

const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();
const rocketMetadata = getMockObjectMetadataItemOrThrow('rocket');
const taskMetadata = getMockObjectMetadataItemOrThrow('task');
const taskTargetsField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: rocketMetadata,
  fieldName: 'taskTargets',
});
const junctionConfig = resolveJunctionConfig({
  settings: taskTargetsField.settings,
  relationObjectMetadataId:
    taskTargetsField.relation?.targetObjectMetadata.id ?? '',
  relationTargetFieldMetadataId:
    taskTargetsField.relation?.targetFieldMetadata.id,
  sourceObjectMetadataId: rocketMetadata.id,
  objectMetadataItems,
});

if (!isUsableJunctionConfig(junctionConfig)) {
  throw new Error('The task target fixture must have a junction relation');
}

const mockCreateJunctionRecord = jest.fn(
  async (recordInput: Partial<ObjectRecord>) => {
    if (!isDefined(recordInput.id)) {
      throw new Error('The nested create must provide a junction ID');
    }

    return {
      id: recordInput.id,
      __typename: 'TaskTarget',
      task: { ...recordInput.task.create, __typename: 'Task' },
    };
  },
);

const setup = () => {
  const store = createStore();
  store.set(recordStoreFamilyState.atomFamily('rocket-id'), {
    id: 'rocket-id',
    __typename: 'Rocket',
    taskTargets: [],
  });
  mockNavigateSidePanelMenu.mockImplementation(
    (page: SidePanelNavigationStackItem) => {
      store.set(isSidePanelOpenedState.atom, true);
      store.set(sidePanelNavigationStackState.atom, [page]);
    },
  );
  mockCloseSidePanelMenu.mockImplementation(() => {
    store.set(isSidePanelOpenedState.atom, false);
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>
      <RecordCreationFormProvider>{children}</RecordCreationFormProvider>
    </Provider>
  );

  return {
    ...renderHook(
      () => ({
        ...useCreateJunctionRecordWithNestedTarget({
          sourceRecordId: 'rocket-id',
          sourceFieldName: 'taskTargets',
          sourceObjectMetadataItem: rocketMetadata,
          junctionConfig,
        }),
        ...useRecordCreationFormContextOrThrow(),
      }),
      { wrapper },
    ),
    store,
  };
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useObjectMetadataItems).mockReturnValue({ objectMetadataItems });
  jest.mocked(useIsFeatureEnabled).mockReturnValue(true);
  jest.mocked(useBuildRecordInputFromRLSPredicates).mockReturnValue({
    buildRecordInputFromRLSPredicates: () => ({ status: 'TODO' }),
  });
  jest.mocked(useCreateOneRecord).mockReturnValue({
    createOneRecord: mockCreateJunctionRecord,
    loading: false,
  });
});

it('creates neither a target nor a link when the form is cancelled', async () => {
  const { result, store } = setup();
  let creation: Promise<unknown> | undefined;
  act(() => {
    creation = result.current.createJunctionRecordWithNestedTarget({
      searchInput: 'New task',
      targetObjectMetadataItemId: taskMetadata.id,
    });
  });

  expect(mockCreateJunctionRecord).not.toHaveBeenCalled();

  act(() => {
    store.set(isSidePanelOpenedState.atom, false);
  });
  await act(async () => {
    expect(await creation).toBeUndefined();
  });

  expect(mockCreateJunctionRecord).not.toHaveBeenCalled();
  expect(
    store.get(recordStoreFamilyState.atomFamily('rocket-id'))?.taskTargets,
  ).toEqual([]);
});

it('atomically saves and links each submitted target, including Create another', async () => {
  const { result, store } = setup();
  let creation: Promise<unknown> | undefined;
  act(() => {
    creation = result.current.createJunctionRecordWithNestedTarget({
      searchInput: 'New task',
      targetObjectMetadataItemId: taskMetadata.id,
    });
  });

  expect(mockCreateJunctionRecord).not.toHaveBeenCalled();

  const [formPage] = store.get(sidePanelNavigationStackState.atom);
  const request = store.get(
    recordCreationFormRequestComponentState.atomFamily({
      instanceId: formPage.pageId,
    }),
  );
  expect(request?.objectMetadataId).toBe(taskMetadata.id);
  expect(request?.initialDraftRecord).toMatchObject({
    title: 'New task',
    status: 'TODO',
  });
  const submitDraft = ({
    draftRecord,
    shouldKeepOpen = false,
  }: {
    draftRecord: Partial<ObjectRecord>;
    shouldKeepOpen?: boolean;
  }) =>
    result.current.settleRecordCreationDraft({
      requestId: formPage.pageId,
      draftRecord: computeRecordFormCreateRecordInput({
        draftRecord: { ...request?.initialDraftRecord, ...draftRecord },
        fieldMetadataItems: taskMetadata.fields,
        objectMetadataItems,
      }),
      shouldKeepOpen,
    });
  const rejection = new Error('The target could not be created');
  mockCreateJunctionRecord.mockRejectedValueOnce(rejection);

  await act(async () => {
    expect(
      await submitDraft({
        draftRecord: { title: 'First task', status: 'DONE' },
        shouldKeepOpen: true,
      }),
    ).toEqual({ error: rejection });
  });
  expect(
    store.get(recordStoreFamilyState.atomFamily('rocket-id'))?.taskTargets,
  ).toEqual([]);

  await act(async () => {
    await submitDraft({
      draftRecord: { title: 'First task', status: 'DONE' },
      shouldKeepOpen: true,
    });
  });
  expect(mockCreateJunctionRecord).toHaveBeenLastCalledWith({
    id: expect.any(String),
    targetRocketId: 'rocket-id',
    task: {
      create: {
        id: expect.any(String),
        title: 'First task',
        status: 'DONE',
      },
    },
  });

  await act(async () => {
    await submitDraft({ draftRecord: { title: 'Second task' } });
  });

  const junctionRecords: ObjectRecord[] = store.get(
    recordStoreFamilyState.atomFamily('rocket-id'),
  )?.taskTargets;
  expect(junctionRecords).toMatchObject([
    { task: { title: 'First task', status: 'DONE' } },
    { task: { title: 'Second task', status: 'TODO' } },
  ]);
  expect(junctionRecords[0].id).not.toBe(junctionRecords[1].id);
  expect(junctionRecords[0].task.id).not.toBe(junctionRecords[1].task.id);
  expect(await creation).toEqual({
    recordId: junctionRecords[1].task.id,
    objectMetadataId: taskMetadata.id,
    isSelected: true,
    isMatchingSearchFilter: true,
  });
});

it('keeps immediate nested creation when the form flag is disabled', async () => {
  jest.mocked(useIsFeatureEnabled).mockReturnValue(false);
  const { result } = setup();

  await act(async () => {
    await result.current.createJunctionRecordWithNestedTarget({
      searchInput: 'Quick task',
      targetObjectMetadataItemId: taskMetadata.id,
    });
  });

  expect(mockNavigateSidePanelMenu).not.toHaveBeenCalled();
  expect(mockCreateJunctionRecord).toHaveBeenCalledWith({
    id: expect.any(String),
    targetRocketId: 'rocket-id',
    task: {
      create: { id: expect.any(String), title: 'Quick task', status: 'TODO' },
    },
  });
});
