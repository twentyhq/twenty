import { recordCalendarRecordIdsComponentState } from '@/object-record/record-calendar/states/recordCalendarRecordIdsComponentState';
import { calendarDayRecordIdsComponentFamilySelector } from '@/object-record/record-calendar/states/selectors/calendarDayRecordsComponentFamilySelector';
import { recordIndexCalendarFieldMetadataIdComponentState } from '@/object-record/record-index/states/recordIndexCalendarFieldMetadataIdComponentState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { createStore } from 'jotai';
import { Temporal } from 'temporal-polyfill';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';

const instanceId = 'calendar-test';

const createCalendarStore = (fieldType: FieldMetadataType) => {
  const store = createStore();
  const objectMetadataItem = getTestEnrichedObjectMetadataItemsMock().find(
    (object) => object.nameSingular === 'company',
  )!;
  const calendarField = {
    ...objectMetadataItem.fields.find((field) => field.name === 'createdAt')!,
    type: fieldType,
  };
  setTestObjectMetadataItemsInMetadataStore(store, [
    {
      ...objectMetadataItem,
      fields: objectMetadataItem.fields.map((field) =>
        field.id === calendarField.id ? calendarField : field,
      ),
    },
  ]);
  store.set(
    recordIndexCalendarFieldMetadataIdComponentState.atomFamily({ instanceId }),
    calendarField.id,
  );
  return store;
};

const getRecordIds = (store: ReturnType<typeof createStore>, day: string) =>
  store.get(
    calendarDayRecordIdsComponentFamilySelector.selectorFamily({
      instanceId,
      familyKey: {
        day: Temporal.PlainDate.from(day),
        timeZone: 'America/Los_Angeles',
      },
    }),
  );

describe('calendarDayRecordIdsComponentFamilySelector', () => {
  it('shows a Date record only on its selected date, ignoring other date fields', () => {
    const store = createCalendarStore(FieldMetadataType.DATE);
    store.set(recordStoreFamilyState.atomFamily('record-id'), {
      id: 'record-id',
      __typename: 'Company',
      createdAt: '2026-07-15',
      endAt: '2026-07-18',
    });
    store.set(
      recordCalendarRecordIdsComponentState.atomFamily({ instanceId }),
      ['record-id'],
    );

    expect(getRecordIds(store, '2026-07-15')).toEqual(['record-id']);
    expect(getRecordIds(store, '2026-07-16')).toEqual([]);
  });

  it('groups DateTime records by the user day, not UTC or hour, and keeps card order', () => {
    const store = createCalendarStore(FieldMetadataType.DATE_TIME);
    const records = [
      { id: 'early', createdAt: '2026-07-15T08:00:00Z', position: 2 },
      { id: 'late', createdAt: '2026-07-16T06:30:00Z', position: 1 },
      { id: 'next-day', createdAt: '2026-07-16T08:00:00Z', position: 3 },
      { id: 'invalid', createdAt: 'not-a-date', position: 4 },
    ];
    for (const record of records) {
      store.set(recordStoreFamilyState.atomFamily(record.id), {
        ...record,
        __typename: 'Company',
      });
    }
    store.set(
      recordCalendarRecordIdsComponentState.atomFamily({ instanceId }),
      records.map((record) => record.id),
    );

    expect(getRecordIds(store, '2026-07-15')).toEqual(['late', 'early']);
    expect(getRecordIds(store, '2026-07-16')).toEqual(['next-day']);
  });
});
