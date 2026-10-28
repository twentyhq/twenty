import { useAddNewRecordAndOpenSidePanel } from '@/object-record/record-field/ui/meta-types/input/hooks/useAddNewRecordAndOpenSidePanel';
import { RecordCreationFormProvider } from '@/object-record/record-form/components/RecordCreationFormProvider';
import { useRecordCreationFormContextOrThrow } from '@/object-record/record-form/contexts/RecordCreationFormContext';
import { computeRecordFormCreateRecordInput } from '@/object-record/record-form/utils/computeRecordFormCreateRecordInput';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { recordCreationFormRequestComponentState } from '@/side-panel/pages/record-creation-form/states/recordCreationFormRequestComponentState';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import {
  sidePanelNavigationStackState,
  type SidePanelNavigationStackItem,
} from '@/side-panel/states/sidePanelNavigationStackState';
import { act, renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const mockCreateOneRecord = jest.fn(async (input: Partial<ObjectRecord>) => ({
  ...input,
  id: input.id ?? 'missing-id',
  __typename: 'Person',
}));
const mockUpdateOneRecord = jest.fn();
const mockOpenRecordInSidePanel = jest.fn();
const mockNavigateSidePanelMenu = jest.fn();
const mockCloseSidePanelMenu = jest.fn();
const mockRefetchQueries = jest.fn();
let mockIsFeatureEnabled = true;

jest.mock('@/object-record/hooks/useCreateOneRecord', () => ({
  useCreateOneRecord: () => ({ createOneRecord: mockCreateOneRecord }),
}));
jest.mock('@/object-record/hooks/useUpdateOneRecord', () => ({
  useUpdateOneRecord: () => ({ updateOneRecord: mockUpdateOneRecord }),
}));
jest.mock('@/object-record/hooks/useBuildRecordInputFromRLSPredicates', () => ({
  useBuildRecordInputFromRLSPredicates: () => ({
    buildRecordInputFromRLSPredicates: () => ({ position: 42 }),
  }),
}));
jest.mock('@/object-record/hooks/useObjectPermissionsForObject', () => ({
  useObjectPermissionsForObject: () => ({ canUpdateObjectRecords: true }),
}));
jest.mock('@/object-metadata/hooks/useApolloCoreClient', () => ({
  useApolloCoreClient: () => ({ refetchQueries: mockRefetchQueries }),
}));
jest.mock('@/side-panel/hooks/useOpenRecordInSidePanel', () => ({
  useOpenRecordInSidePanel: () => ({
    openRecordInSidePanel: mockOpenRecordInSidePanel,
  }),
}));
jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({
    navigateSidePanelMenu: mockNavigateSidePanelMenu,
    closeSidePanelMenu: mockCloseSidePanelMenu,
  }),
}));
jest.mock('@/workspace/hooks/useIsFeatureEnabled', () => ({
  useIsFeatureEnabled: () => mockIsFeatureEnabled,
}));

const RELATIONSHIP_SETTINGS = {
  'company-people': ['company', 'person', 'people', 'company'],
  'person-company': ['person', 'company', 'company', 'people'],
  'rocket-owned-pets': ['rocket', 'pet', 'ownedPets', 'polymorphicOwner'],
  'rocket-helped-pets': ['rocket', 'pet', 'helpedPets', 'polymorphicHelper'],
};

const setup = (
  relationship: keyof typeof RELATIONSHIP_SETTINGS = 'company-people',
) => {
  const [sourceName, targetName, sourceFieldName, targetFieldName] =
    RELATIONSHIP_SETTINGS[relationship];
  const sourceObject = getMockObjectMetadataItemOrThrow(sourceName);
  const targetObject = getMockObjectMetadataItemOrThrow(targetName);
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
  const hook = renderHook(
    () => ({
      ...useAddNewRecordAndOpenSidePanel({
        fieldMetadataItem: getMockFieldMetadataItemOrThrow({
          objectMetadataItem: sourceObject,
          fieldName: sourceFieldName,
        }),
        objectMetadataItem: sourceObject,
        relationObjectMetadataNameSingular: targetObject.nameSingular,
        relationObjectMetadataItem: targetObject,
        relationFieldMetadataItem: getMockFieldMetadataItemOrThrow({
          objectMetadataItem: targetObject,
          fieldName: targetFieldName,
        }),
        recordId: 'parent-record',
      }),
      ...useRecordCreationFormContextOrThrow(),
    }),
    { wrapper },
  );
  const start = (searchInput = 'Alex Morgan') => {
    let creation: Promise<string | undefined> | undefined;
    act(() => {
      creation =
        hook.result.current.createNewRecordAndOpenSidePanel?.(searchInput);
    });
    return creation;
  };
  const getDraft = () => {
    const [page] = store.get(sidePanelNavigationStackState.atom);
    return store.get(
      recordCreationFormRequestComponentState.atomFamily({
        instanceId: page.pageId,
      }),
    )?.initialDraftRecord;
  };
  const submit = async ({
    draftRecord,
    shouldKeepOpen = false,
  }: {
    draftRecord: Partial<ObjectRecord> | null;
    shouldKeepOpen?: boolean;
  }) => {
    const [page] = store.get(sidePanelNavigationStackState.atom);
    let result: { error?: unknown } = {};
    await act(async () => {
      result = await hook.result.current.settleRecordCreationDraft({
        requestId: page.pageId,
        draftRecord:
          draftRecord === null
            ? null
            : computeRecordFormCreateRecordInput({
                draftRecord: { ...getDraft(), ...draftRecord },
                fieldMetadataItems: targetObject.fields,
                objectMetadataItems: getTestEnrichedObjectMetadataItemsMock(),
              }),
        shouldKeepOpen,
      });
    });
    return result;
  };
  return { ...hook, start, submit, getDraft };
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUpdateOneRecord.mockReset();
  mockIsFeatureEnabled = true;
});

it('waits for form submission and creates nothing when cancelled', async () => {
  const { start, submit } = setup();
  const creation = start();

  expect(mockCreateOneRecord).not.toHaveBeenCalled();
  expect(mockUpdateOneRecord).not.toHaveBeenCalled();
  expect(mockOpenRecordInSidePanel).not.toHaveBeenCalled();

  await submit({ draftRecord: null });
  await expect(creation).resolves.toBeUndefined();
  expect(mockCreateOneRecord).not.toHaveBeenCalled();
  expect(mockOpenRecordInSidePanel).not.toHaveBeenCalled();
});

it('creates distinct linked records on each submission and respects edited defaults', async () => {
  const { start, submit } = setup();
  const creation = start();

  await submit({
    draftRecord: { name: { firstName: 'Alex', lastName: 'Morgan' } },
    shouldKeepOpen: true,
  });
  expect(mockOpenRecordInSidePanel).not.toHaveBeenCalled();
  await submit({
    draftRecord: {
      name: { firstName: 'Robin', lastName: 'Smith' },
      position: 99,
      companyId: 'another-company',
    },
  });
  const [firstInput, secondInput] = mockCreateOneRecord.mock.calls.map(
    ([input]) => input,
  );

  expect(mockCreateOneRecord).toHaveBeenCalledTimes(2);
  expect(firstInput).toMatchObject({
    position: 42,
    companyId: 'parent-record',
  });
  expect(secondInput).toMatchObject({
    name: { firstName: 'Robin', lastName: 'Smith' },
    position: 99,
    companyId: 'another-company',
  });
  expect(firstInput.id).not.toBe(secondInput.id);
  await expect(creation).resolves.toBe(secondInput.id);
  expect(mockOpenRecordInSidePanel).toHaveBeenCalledTimes(1);
});

it.each([false, true])(
  'retries a failed parent attachment without creating another target (edited: %s)',
  async (isDraftEdited) => {
    const { start, submit } = setup('person-company');
    const creation = start('Original');
    const attachmentError = new Error('Could not link company');
    mockUpdateOneRecord.mockRejectedValueOnce(attachmentError);

    await expect(
      submit({ draftRecord: { name: 'Original' } }),
    ).resolves.toEqual({
      error: attachmentError,
    });
    expect(mockCreateOneRecord).toHaveBeenCalledTimes(1);
    expect(mockOpenRecordInSidePanel).not.toHaveBeenCalled();

    if (!isDraftEdited) {
      mockUpdateOneRecord.mockImplementation(({ objectNameSingular }) => {
        if (objectNameSingular === 'company') {
          return Promise.reject(new Error('Target updates are forbidden'));
        }
        return Promise.resolve();
      });
    }
    await expect(
      submit({
        draftRecord: { name: isDraftEdited ? 'Corrected' : 'Original' },
      }),
    ).resolves.toEqual({});
    const targetId = mockCreateOneRecord.mock.calls[0][0].id;
    expect(mockCreateOneRecord).toHaveBeenCalledTimes(1);
    expect(mockUpdateOneRecord).toHaveBeenCalledTimes(isDraftEdited ? 3 : 2);
    if (isDraftEdited) {
      expect(mockUpdateOneRecord).toHaveBeenNthCalledWith(2, {
        objectNameSingular: 'company',
        idToUpdate: targetId,
        updateOneRecordInput: { name: 'Corrected', position: 42 },
      });
    }
    expect(mockUpdateOneRecord).toHaveBeenLastCalledWith({
      objectNameSingular: 'person',
      idToUpdate: 'parent-record',
      updateOneRecordInput: { companyId: targetId },
    });
    await expect(creation).resolves.toBe(targetId);
  },
);

const MORPH_CHANGES = [
  { label: 'clears', selection: null, expectedJoinColumns: {} },
  {
    label: 'replaces',
    selection: {
      targetObjectMetadataId:
        getMockObjectMetadataItemOrThrow('surveyResult').id,
      id: 'replacement-owner',
    },
    expectedJoinColumns: {
      polymorphicOwnerSurveyResultId: 'replacement-owner',
    },
  },
];

it('prefills the logical morph selection and creates with its normalized join column', async () => {
  const { start, submit, getDraft } = setup('rocket-owned-pets');
  const creation = start('Rex');

  expect(getDraft()).toMatchObject({
    polymorphicOwner: {
      targetObjectMetadataId: getMockObjectMetadataItemOrThrow('rocket').id,
      id: 'parent-record',
    },
  });
  await submit({ draftRecord: {} });
  await creation;

  expect(mockCreateOneRecord).toHaveBeenCalledWith({
    id: expect.any(String),
    name: 'Rex',
    position: 42,
    polymorphicOwnerRocketId: 'parent-record',
  });
});

it.each(MORPH_CHANGES)(
  '$label the prefilled morph parent without restoring its old join column',
  async ({ selection, expectedJoinColumns }) => {
    const { start, submit } = setup('rocket-owned-pets');
    const creation = start('Rex');

    await submit({ draftRecord: { polymorphicOwner: selection } });
    await creation;

    expect(mockCreateOneRecord).toHaveBeenCalledWith({
      id: expect.any(String),
      name: 'Rex',
      position: 42,
      ...expectedJoinColumns,
    });
  },
);

it.each(MORPH_CHANGES)(
  '$label a saved morph selection while retrying its source attachment',
  async ({ selection, expectedJoinColumns }) => {
    const { start, submit } = setup('rocket-helped-pets');
    const creation = start('Rex');
    const attachmentError = new Error('Could not link pet');
    mockUpdateOneRecord.mockRejectedValueOnce(attachmentError);

    await expect(
      submit({
        draftRecord: {
          polymorphicOwner: {
            targetObjectMetadataId:
              getMockObjectMetadataItemOrThrow('rocket').id,
            id: 'original-owner',
          },
        },
      }),
    ).resolves.toEqual({ error: attachmentError });
    await expect(
      submit({ draftRecord: { polymorphicOwner: selection } }),
    ).resolves.toEqual({});
    const targetId = mockCreateOneRecord.mock.calls[0][0].id;

    expect(mockCreateOneRecord).toHaveBeenCalledTimes(1);
    expect(mockUpdateOneRecord).toHaveBeenNthCalledWith(2, {
      objectNameSingular: 'pet',
      idToUpdate: targetId,
      updateOneRecordInput: {
        name: 'Rex',
        position: 42,
        polymorphicOwnerRocketId: null,
        ...expectedJoinColumns,
      },
    });
    await expect(creation).resolves.toBe(targetId);
  },
);

it('keeps raw morph join columns when the flag is off', async () => {
  mockIsFeatureEnabled = false;
  const { start } = setup('rocket-owned-pets');
  await act(async () => {
    await start('Rex');
  });

  expect(mockCreateOneRecord).toHaveBeenCalledWith({
    id: expect.any(String),
    name: 'Rex',
    position: 42,
    polymorphicOwnerRocketId: 'parent-record',
  });
});

it('keeps immediate linked creation when the flag is off', async () => {
  mockIsFeatureEnabled = false;
  const { start } = setup();
  let createdId: string | undefined;
  await act(async () => {
    createdId = await start();
  });

  expect(mockCreateOneRecord).toHaveBeenCalledWith(
    expect.objectContaining({
      name: { firstName: 'Alex', lastName: 'Morgan' },
      position: 42,
      companyId: 'parent-record',
    }),
  );
  expect(mockNavigateSidePanelMenu).not.toHaveBeenCalled();
  expect(mockOpenRecordInSidePanel).toHaveBeenCalledWith({
    recordId: createdId,
    objectNameSingular: 'person',
  });
});
