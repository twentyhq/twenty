import { renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { act, type PropsWithChildren } from 'react';

import { RecordComponentInstanceContextsWrapper } from '@/object-record/components/RecordComponentInstanceContextsWrapper';
import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';
import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { relationTargetFieldMetadataIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/relationTargetFieldMetadataIdUsedInDropdownComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { subFieldNameUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/subFieldNameUsedInDropdownComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { getEditableChipObjectFilterDropdownComponentInstanceId } from '@/views/editable-chip/utils/getEditableChipObjectFilterDropdownComponentInstanceId';
import { useSetEditableFilterChipDropdownStates } from '@/views/hooks/useSetEditableFilterChipDropdownStates';
import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { JestRecordIndexContextProviderWrapper } from '~/testing/jest/JestRecordIndexContextProviderWrapper';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';

const personObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');
const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');
const companyFieldMetadataItem = personObjectMetadataItem.fields.find(
  (fieldMetadataItem) => fieldMetadataItem.name === 'company',
);
const companyNameFieldMetadataItem = companyObjectMetadataItem.fields.find(
  (fieldMetadataItem) => fieldMetadataItem.name === 'name',
);

if (
  !isDefined(companyFieldMetadataItem) ||
  !isDefined(companyNameFieldMetadataItem)
) {
  throw new Error('Missing company relation metadata in test fixtures');
}

const recordFilter: RecordFilter = {
  id: 'filter-id',
  fieldMetadataId: companyFieldMetadataItem.id,
  relationTargetFieldMetadataId: companyNameFieldMetadataItem.id,
  type: FieldMetadataType.TEXT,
  operand: ViewFilterOperand.CONTAINS,
  value: 'Acme',
  displayValue: 'Acme',
  label: 'Company / Name',
};

const renderSubject = () => {
  const store = createStore();

  setTestObjectMetadataItemsInMetadataStore(
    store,
    getTestEnrichedObjectMetadataItemsMock(),
  );

  const wrapper = ({ children }: PropsWithChildren) => (
    <JotaiProvider store={store}>
      <RecordComponentInstanceContextsWrapper componentInstanceId="record-index-id">
        <JestRecordIndexContextProviderWrapper
          objectMetadataItem={personObjectMetadataItem}
        >
          {children}
        </JestRecordIndexContextProviderWrapper>
      </RecordComponentInstanceContextsWrapper>
    </JotaiProvider>
  );

  const renderResult = renderHook(
    () => useSetEditableFilterChipDropdownStates(),
    { wrapper },
  );

  return { ...renderResult, store };
};

describe('useSetEditableFilterChipDropdownStates', () => {
  it('initializes only the requested scoped dropdown instance', () => {
    const { result, store } = renderSubject();
    const scopedInstanceId =
      getEditableChipObjectFilterDropdownComponentInstanceId({
        recordFilterId: recordFilter.id,
        dropdownIdScope: 'widget-id',
      });
    const unscopedInstanceId =
      getEditableChipObjectFilterDropdownComponentInstanceId({
        recordFilterId: recordFilter.id,
      });

    act(() => {
      result.current.setEditableFilterChipDropdownStates(
        recordFilter,
        scopedInstanceId,
      );
    });

    expect(
      store.get(
        fieldMetadataItemIdUsedInDropdownComponentState.atomFamily({
          instanceId: scopedInstanceId,
        }),
      ),
    ).toBe(companyFieldMetadataItem.id);
    expect(
      store.get(
        selectedOperandInDropdownComponentState.atomFamily({
          instanceId: scopedInstanceId,
        }),
      ),
    ).toBe(recordFilter.operand);
    expect(
      store.get(
        objectFilterDropdownCurrentRecordFilterComponentState.atomFamily({
          instanceId: scopedInstanceId,
        }),
      ),
    ).toEqual(recordFilter);
    expect(
      store.get(
        subFieldNameUsedInDropdownComponentState.atomFamily({
          instanceId: scopedInstanceId,
        }),
      ),
    ).toBeUndefined();
    expect(
      store.get(
        relationTargetFieldMetadataIdUsedInDropdownComponentState.atomFamily({
          instanceId: scopedInstanceId,
        }),
      ),
    ).toBe(companyNameFieldMetadataItem.id);

    expect(
      store.get(
        fieldMetadataItemIdUsedInDropdownComponentState.atomFamily({
          instanceId: unscopedInstanceId,
        }),
      ),
    ).toBeNull();
    expect(
      store.get(
        objectFilterDropdownCurrentRecordFilterComponentState.atomFamily({
          instanceId: unscopedInstanceId,
        }),
      ),
    ).toBeUndefined();
  });

  it('keeps the unscoped instance as the default target', () => {
    const { result, store } = renderSubject();
    const unscopedInstanceId =
      getEditableChipObjectFilterDropdownComponentInstanceId({
        recordFilterId: recordFilter.id,
      });

    act(() => {
      result.current.setEditableFilterChipDropdownStates(recordFilter);
    });

    expect(
      store.get(
        objectFilterDropdownCurrentRecordFilterComponentState.atomFamily({
          instanceId: unscopedInstanceId,
        }),
      ),
    ).toEqual(recordFilter);
  });
});
