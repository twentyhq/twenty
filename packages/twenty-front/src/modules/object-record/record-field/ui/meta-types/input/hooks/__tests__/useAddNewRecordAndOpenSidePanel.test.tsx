import { useAddNewRecordAndOpenSidePanel } from '@/object-record/record-field/ui/meta-types/input/hooks/useAddNewRecordAndOpenSidePanel';
import { RecordCreationFormProvider } from '@/object-record/record-form/components/RecordCreationFormProvider';
import { useRecordCreationFormContextOrThrow } from '@/object-record/record-form/contexts/RecordCreationFormContext';
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

const mockCreateOneRecord = jest.fn(
  async (recordInput: Partial<ObjectRecord>) => recordInput,
);
const mockUpdateOneRecord = jest.fn();
const mockOpenRecordInSidePanel = jest.fn();
const mockNavigateSidePanelMenu = jest.fn();

jest.mock('@/object-record/hooks/useCreateOneRecord', () => ({
  useCreateOneRecord: () => ({ createOneRecord: mockCreateOneRecord }),
}));
jest.mock('@/object-record/hooks/useUpdateOneRecord', () => ({
  useUpdateOneRecord: () => ({ updateOneRecord: mockUpdateOneRecord }),
}));
jest.mock('@/object-record/hooks/useBuildRecordInputFromRLSPredicates', () => ({
  useBuildRecordInputFromRLSPredicates: () => ({
    buildRecordInputFromRLSPredicates: () => ({}),
  }),
}));
jest.mock('@/object-record/hooks/useObjectPermissionsForObject', () => ({
  useObjectPermissionsForObject: () => ({ canUpdateObjectRecords: true }),
}));
jest.mock('@/object-metadata/hooks/useApolloCoreClient', () => ({
  useApolloCoreClient: () => ({ refetchQueries: jest.fn() }),
}));
jest.mock('@/side-panel/hooks/useOpenRecordInSidePanel', () => ({
  useOpenRecordInSidePanel: () => ({
    openRecordInSidePanel: mockOpenRecordInSidePanel,
  }),
}));
jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({
    navigateSidePanelMenu: mockNavigateSidePanelMenu,
    closeSidePanelMenu: jest.fn(),
  }),
}));

type Relation = {
  sourceObject: string;
  targetObject: string;
  sourceField: string;
  targetField: string;
};

const COMPANY_PEOPLE: Relation = {
  sourceObject: 'company',
  targetObject: 'person',
  sourceField: 'people',
  targetField: 'company',
};
const PERSON_COMPANY: Relation = {
  sourceObject: 'person',
  targetObject: 'company',
  sourceField: 'company',
  targetField: 'people',
};
const ROCKET_OWNED_PETS: Relation = {
  sourceObject: 'rocket',
  targetObject: 'pet',
  sourceField: 'ownedPets',
  targetField: 'polymorphicOwner',
};
const PET_CARE_AGREEMENT_PET: Relation = {
  sourceObject: 'petCareAgreement',
  targetObject: 'pet',
  sourceField: 'pet',
  targetField: 'caretakers',
};

const setup = (relation: Relation) => {
  const sourceObject = getMockObjectMetadataItemOrThrow(relation.sourceObject);
  const targetObject = getMockObjectMetadataItemOrThrow(relation.targetObject);
  const store = createStore();
  mockNavigateSidePanelMenu.mockImplementation(
    (page: SidePanelNavigationStackItem) => {
      store.set(isSidePanelOpenedState.atom, true);
      store.set(sidePanelNavigationStackState.atom, [page]);
    },
  );
  const { result } = renderHook(
    () => ({
      ...useAddNewRecordAndOpenSidePanel({
        fieldMetadataItem: getMockFieldMetadataItemOrThrow({
          objectMetadataItem: sourceObject,
          fieldName: relation.sourceField,
        }),
        objectMetadataItem: sourceObject,
        relationObjectMetadataNameSingular: targetObject.nameSingular,
        relationObjectMetadataItem: targetObject,
        relationFieldMetadataItem: getMockFieldMetadataItemOrThrow({
          objectMetadataItem: targetObject,
          fieldName: relation.targetField,
        }),
        recordId: 'parent-record',
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
  const getFormPageId = () =>
    store.get(sidePanelNavigationStackState.atom)[0].pageId;
  const start = (searchInput: string) => {
    let creation: Promise<string | undefined> | undefined;
    act(() => {
      creation = result.current.createNewRecordAndOpenSidePanel?.(searchInput);
    });
    return creation;
  };
  const getRequest = () =>
    store.get(
      recordCreationFormRequestComponentState.atomFamily({
        instanceId: getFormPageId(),
      }),
    );
  const submit = ({
    draftRecord,
    shouldKeepOpen = false,
  }: {
    draftRecord: Partial<ObjectRecord> | null;
    shouldKeepOpen?: boolean;
  }) =>
    act(async () => {
      await result.current.settleRecordCreationDraft({
        requestId: getFormPageId(),
        draftRecord,
        shouldKeepOpen,
      });
    });

  return { result, start, getRequest, submit };
};

beforeEach(() => {
  jest.clearAllMocks();
});

it('creates nothing when the form is cancelled', async () => {
  const { start, submit } = setup(COMPANY_PEOPLE);
  const creation = start('Alex Morgan');

  await submit({ draftRecord: null });

  await expect(creation).resolves.toBeUndefined();
  expect(mockCreateOneRecord).not.toHaveBeenCalled();
  expect(mockOpenRecordInSidePanel).not.toHaveBeenCalled();
});

it('prefills the form and links each submitted record, including Create another', async () => {
  const { start, submit, getRequest } = setup(COMPANY_PEOPLE);
  const creation = start('Alex Morgan');

  expect(getRequest()).toMatchObject({
    initialDraftRecord: {
      name: { firstName: 'Alex', lastName: 'Morgan' },
      companyId: 'parent-record',
    },
    canCreateAnother: true,
  });

  await submit({
    draftRecord: { name: { firstName: 'Alex' }, companyId: 'parent-record' },
    shouldKeepOpen: true,
  });
  await submit({
    draftRecord: { name: { firstName: 'Robin' }, companyId: 'parent-record' },
  });

  const [[firstRecord], [secondRecord]] = mockCreateOneRecord.mock.calls;
  expect(firstRecord).toMatchObject({ name: { firstName: 'Alex' } });
  expect(secondRecord).toMatchObject({ name: { firstName: 'Robin' } });
  expect(firstRecord.id).not.toBe(secondRecord.id);
  await expect(creation).resolves.toBe(secondRecord.id);
  expect(mockOpenRecordInSidePanel).toHaveBeenCalledTimes(1);
});

it('links the parent from a to-one picker and hides Create another', async () => {
  const { start, submit, getRequest } = setup(PERSON_COMPANY);
  const creation = start('Acme');

  expect(getRequest()?.canCreateAnother).toBe(false);

  await submit({ draftRecord: { name: 'Acme' } });

  const [[createdRecord]] = mockCreateOneRecord.mock.calls;
  expect(mockUpdateOneRecord).toHaveBeenCalledWith({
    objectNameSingular: 'person',
    idToUpdate: 'parent-record',
    updateOneRecordInput: { companyId: createdRecord.id },
  });
  await expect(creation).resolves.toBe(createdRecord.id);
});

it('reuses the saved target and applies edits when retrying a failed attachment', async () => {
  const attachmentError = new Error('The parent could not be updated');
  mockUpdateOneRecord
    .mockRejectedValueOnce(attachmentError)
    .mockRejectedValueOnce(attachmentError);
  const { start, submit } = setup(PET_CARE_AGREEMENT_PET);
  const creation = start('Rex');
  const draftRecord = {
    name: 'Rex',
    polymorphicOwnerRocketId: 'rocket-record',
  };

  await submit({ draftRecord });
  await submit({ draftRecord });

  expect(mockCreateOneRecord).toHaveBeenCalledTimes(1);
  expect(mockUpdateOneRecord).toHaveBeenCalledTimes(2);
  expect(mockOpenRecordInSidePanel).not.toHaveBeenCalled();

  await submit({ draftRecord: { name: 'Rex renamed' } });

  const [[createdRecord]] = mockCreateOneRecord.mock.calls;
  expect(mockCreateOneRecord).toHaveBeenCalledTimes(1);
  expect(mockUpdateOneRecord).toHaveBeenNthCalledWith(3, {
    objectNameSingular: 'pet',
    idToUpdate: createdRecord.id,
    updateOneRecordInput: {
      name: 'Rex renamed',
      polymorphicOwnerRocketId: null,
    },
  });
  expect(mockUpdateOneRecord).toHaveBeenLastCalledWith({
    objectNameSingular: 'petCareAgreement',
    idToUpdate: 'parent-record',
    updateOneRecordInput: { petId: createdRecord.id },
  });
  await expect(creation).resolves.toBe(createdRecord.id);
});

it('prefills a morph parent as a selection the form can show', () => {
  const { start, getRequest } = setup(ROCKET_OWNED_PETS);
  start('Rex');

  expect(getRequest()?.initialDraftRecord).toEqual({
    name: 'Rex',
    polymorphicOwner: {
      targetObjectMetadataId: getMockObjectMetadataItemOrThrow('rocket').id,
      id: 'parent-record',
    },
  });
});

it.each([
  {
    relationLabel: 'a relation',
    relation: COMPANY_PEOPLE,
    searchInput: 'Alex Morgan',
    expectedRecordInput: {
      name: { firstName: 'Alex', lastName: 'Morgan' },
      companyId: 'parent-record',
    },
  },
  {
    relationLabel: 'a morph relation',
    relation: ROCKET_OWNED_PETS,
    searchInput: 'Rex',
    expectedRecordInput: {
      name: 'Rex',
      polymorphicOwnerRocketId: 'parent-record',
    },
  },
])(
  'opens the creation form for $relationLabel without a feature flag',
  async ({ relation, searchInput, expectedRecordInput }) => {
    const { start, submit } = setup(relation);
    const creation = start(searchInput);

    expect(mockNavigateSidePanelMenu).toHaveBeenCalled();
    expect(mockCreateOneRecord).not.toHaveBeenCalled();

    await submit({ draftRecord: expectedRecordInput });
    const createdRecordId = await creation;
    expect(mockCreateOneRecord).toHaveBeenCalledWith({
      id: createdRecordId,
      ...expectedRecordInput,
    });
    expect(mockOpenRecordInSidePanel).toHaveBeenCalledWith({
      recordId: createdRecordId,
      objectNameSingular: relation.targetObject,
    });
  },
);
