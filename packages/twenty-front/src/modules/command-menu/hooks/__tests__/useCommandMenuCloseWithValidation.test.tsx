import { act, renderHook } from '@testing-library/react';

import { requiredFieldsValidationState } from '@/command-menu/states/requiredFieldsValidationState';
import { newlyCreatedRecordIdsState } from '@/object-record/record-side-panel/states/newlyCreatedRecordIdsState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { viewableRecordIdComponentState } from '@/side-panel/pages/record-page/states/viewableRecordIdComponentState';
import { viewableRecordNameSingularComponentState } from '@/side-panel/pages/record-page/states/viewableRecordNameSingularComponentState';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { SidePanelPages } from 'twenty-shared/types';
import { IconSearch } from 'twenty-ui/display';

import { useCommandMenuCloseWithValidation } from '@/command-menu/hooks/useCommandMenuCloseWithValidation';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { mockedPersonRecords } from '~/testing/mock-data/generated/data/people/mock-people-data';
import { getRecordFromRecordNode } from '@/object-record/cache/utils/getRecordFromRecordNode';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { type Store } from 'jotai/vanilla/store';

const mockCloseSidePanelMenu = jest.fn();
const mockGoBackFromSidePanel = jest.fn();
const mockOpenModal = jest.fn();

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({
    closeSidePanelMenu: mockCloseSidePanelMenu,
  }),
}));

jest.mock('@/side-panel/hooks/useSidePanelHistory', () => ({
  useSidePanelHistory: () => ({
    goBackFromSidePanel: mockGoBackFromSidePanel,
  }),
}));

jest.mock('@/ui/layout/modal/hooks/useModal', () => ({
  useModal: () => ({
    openModal: mockOpenModal,
  }),
}));

const flatPersonRecord = getRecordFromRecordNode({
  recordNode: mockedPersonRecords[0],
});

describe('useCommandMenuCloseWithValidation', () => {
  const pageId = 'test-side-panel-page';
  const basePersonMetadata = getMockObjectMetadataItemOrThrow('person');
  const requiredField =
    basePersonMetadata.fields.find((field) => field.name === 'name') ??
    basePersonMetadata.fields[0];

  const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock().map(
    (item) =>
      item.nameSingular === 'person'
        ? {
            ...item,
            fields: item.fields.map((field) =>
              field.id === requiredField.id
                ? {
                    ...field,
                    requiredCondition: { type: 'always' },
                  }
                : field,
            ),
          }
        : item,
  );

  const deletedRecord = {
    ...flatPersonRecord,
    [requiredField.name]: null,
    deletedAt: '2026-03-11T12:00:00.000Z',
  };

  const initializeDeletedRecordState = (store: Store) => {
    store.set(sidePanelPageState.atom, SidePanelPages.ViewRecord);
    store.set(sidePanelNavigationStackState.atom, [
      {
        page: SidePanelPages.ViewRecord,
        pageTitle: 'Person',
        pageIcon: IconSearch,
        pageId,
      },
    ]);
    store.set(
      viewableRecordIdComponentState.atomFamily({ instanceId: pageId }),
      deletedRecord.id,
    );
    store.set(
      viewableRecordNameSingularComponentState.atomFamily({ instanceId: pageId }),
      'person',
    );
    store.set(
      newlyCreatedRecordIdsState.atom,
      new Map([[deletedRecord.id, 'person']]),
    );
    store.set(recordStoreFamilyState.atomFamily(deletedRecord.id), deletedRecord);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    ['closeWithValidation', mockCloseSidePanelMenu],
    ['goBackWithValidation', mockGoBackFromSidePanel],
  ] as const)(
    'bypasses the required-fields modal for deleted records when calling %s',
    (methodName, expectedActionMock) => {
      let store: Store | undefined;

      const { result } = renderHook(() => useCommandMenuCloseWithValidation(), {
        wrapper: getJestMetadataAndApolloMocksWrapper({
          objectMetadataItems,
          onInitializeJotaiStore: (jotaiStore) => {
            store = jotaiStore;
            initializeDeletedRecordState(jotaiStore);
          },
        }),
      });

      act(() => {
        result.current[methodName]();
      });

      expect(expectedActionMock).toHaveBeenCalledTimes(1);
      expect(mockOpenModal).not.toHaveBeenCalled();
      expect(store?.get(requiredFieldsValidationState.atom)).toBeNull();
    },
  );
});
