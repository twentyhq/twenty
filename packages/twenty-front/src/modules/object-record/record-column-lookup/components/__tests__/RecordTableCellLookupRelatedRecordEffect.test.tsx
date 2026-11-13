import { render } from '@testing-library/react';
import { createStore, Provider } from 'jotai';

import { RecordTableCellLookupRelatedRecordEffect } from '@/object-record/record-column-lookup/components/RecordTableCellLookupRelatedRecordEffect';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';

const COMPANY_ID = 'company-id';

describe('RecordTableCellLookupRelatedRecordEffect', () => {
  it('copies the nested record into the store', () => {
    const store = createStore();

    render(
      <Provider store={store}>
        <RecordTableCellLookupRelatedRecordEffect
          relatedRecord={{
            id: COMPANY_ID,
            __typename: 'Company',
            city: 'Paris',
          }}
        />
      </Provider>,
    );

    expect(store.get(recordStoreFamilyState.atomFamily(COMPANY_ID))).toEqual(
      expect.objectContaining({ city: 'Paris' }),
    );
  });

  it('does not overwrite a value saved since the query when the cell remounts', () => {
    const store = createStore();
    const nestedCompany = {
      id: COMPANY_ID,
      __typename: 'Company',
      city: 'Paris',
    };

    const renderEffect = () =>
      render(
        <Provider store={store}>
          <RecordTableCellLookupRelatedRecordEffect
            relatedRecord={nestedCompany}
          />
        </Provider>,
      );

    renderEffect().unmount();

    store.set(recordStoreFamilyState.atomFamily(COMPANY_ID), {
      ...nestedCompany,
      city: 'Lyon',
    });

    renderEffect();

    expect(store.get(recordStoreFamilyState.atomFamily(COMPANY_ID))).toEqual(
      expect.objectContaining({ city: 'Lyon' }),
    );
  });
});
