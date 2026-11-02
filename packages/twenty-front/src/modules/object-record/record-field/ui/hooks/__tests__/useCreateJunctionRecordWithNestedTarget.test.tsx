import { act, renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useBuildRecordInputFromRLSPredicates } from '@/object-record/hooks/useBuildRecordInputFromRLSPredicates';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useCreateJunctionRecordWithNestedTarget } from '@/object-record/record-field/ui/hooks/useCreateJunctionRecordWithNestedTarget';
import { isUsableJunctionConfig } from '@/object-record/record-field/ui/utils/junction/isUsableJunctionConfig';
import { resolveJunctionConfig } from '@/object-record/record-field/ui/utils/junction/resolveJunctionConfig';
import { RecordCreationFormProvider } from '@/object-record/record-form/components/RecordCreationFormProvider';
import { useRecordCreationFormContextOrThrow } from '@/object-record/record-form/contexts/RecordCreationFormContext';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
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

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({
    navigateSidePanelMenu: mockNavigateSidePanelMenu,
    closeSidePanelMenu: jest.fn(),
  }),
}));

jest.mock('twenty-ui/components/feedback', () => ({
  useToast: () => ({ enqueueToast: jest.fn() }),
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
  async ({ id = '', task }: Partial<ObjectRecord>) => ({
    id,
    __typename: 'TaskTarget',
    task: task.create,
  }),
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

  const { result } = renderHook(
    () => ({
      ...useCreateJunctionRecordWithNestedTarget({
        sourceRecordId: 'rocket-id',
        sourceFieldName: 'taskTargets',
        sourceObjectMetadataItem: rocketMetadata,
        junctionConfig,
      }),
      ...useRecordCreationFormContextOrThrow(),
    }),
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <Provider store={store}>
          <RecordCreationFormProvider>{children}</RecordCreationFormProvider>
        </Provider>
      ),
    },
  );

  const start = () => {
    let creation:
      | Promise<RecordPickerPickableMorphItem | undefined>
      | undefined;
    act(() => {
      creation = result.current.createJunctionRecordWithNestedTarget({
        searchInput: 'New task',
        targetObjectMetadataItemId: taskMetadata.id,
      });
    });
    return creation;
  };

  return { result, store, start };
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useObjectMetadataItems).mockReturnValue({ objectMetadataItems });
  jest.mocked(useIsFeatureEnabled).mockReturnValue(true);
  jest.mocked(useBuildRecordInputFromRLSPredicates).mockReturnValue({
    buildRecordInputFromRLSPredicates: () => ({}),
  });
  jest.mocked(useCreateOneRecord).mockReturnValue({
    createOneRecord: mockCreateJunctionRecord,
    loading: false,
  });
});

it('creates nothing when the form is cancelled', async () => {
  const { store, start } = setup();
  const creation = start();

  act(() => {
    store.set(isSidePanelOpenedState.atom, false);
  });
  await act(async () => {
    await expect(creation).resolves.toBeUndefined();
  });
  expect(mockCreateJunctionRecord).not.toHaveBeenCalled();
  expect(
    store.get(recordStoreFamilyState.atomFamily('rocket-id'))?.taskTargets,
  ).toEqual([]);
});

it('creates and links a target for each submission, including Create another', async () => {
  const { result, store, start } = setup();
  const creation = start();
  const [formPage] = store.get(sidePanelNavigationStackState.atom);

  expect(
    store.get(
      recordCreationFormRequestComponentState.atomFamily({
        instanceId: formPage.pageId,
      }),
    ),
  ).toMatchObject({
    objectMetadataId: taskMetadata.id,
    initialDraftRecord: { title: 'New task' },
  });

  const submit = ({
    draftRecord,
    shouldKeepOpen = false,
  }: {
    draftRecord: Partial<ObjectRecord>;
    shouldKeepOpen?: boolean;
  }) =>
    act(async () => {
      await result.current.settleRecordCreationDraft({
        requestId: formPage.pageId,
        draftRecord,
        shouldKeepOpen,
      });
    });

  await submit({ draftRecord: { title: 'First task' }, shouldKeepOpen: true });
  await submit({ draftRecord: { title: 'Second task' } });
  let createdTarget: RecordPickerPickableMorphItem | undefined;
  await act(async () => {
    createdTarget = await creation;
  });

  expect(mockCreateJunctionRecord).toHaveBeenLastCalledWith({
    id: expect.any(String),
    targetRocketId: 'rocket-id',
    task: { create: { id: expect.any(String), title: 'Second task' } },
  });
  const [firstLink, secondLink] = store.get(
    recordStoreFamilyState.atomFamily('rocket-id'),
  )?.taskTargets;
  expect(firstLink.task.title).toBe('First task');
  expect(secondLink.task.title).toBe('Second task');
  expect(firstLink.id).not.toBe(secondLink.id);
  expect(createdTarget).toEqual({
    recordId: secondLink.task.id,
    objectMetadataId: taskMetadata.id,
    isSelected: true,
    isMatchingSearchFilter: true,
  });
});

it('creates and links the target right away when the form flag is off', async () => {
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
    task: { create: { id: expect.any(String), title: 'Quick task' } },
  });
});
