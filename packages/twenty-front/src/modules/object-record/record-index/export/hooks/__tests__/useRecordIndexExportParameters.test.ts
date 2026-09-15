import { type ContextStoreTargetedRecordsRule } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { useRecordIndexExportParameters } from '@/object-record/record-index/export/hooks/useRecordIndexExportParameters';
import { renderHook } from '@testing-library/react';
import { getJestMetadataAndApolloMocksAndCommandMenuWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksAndCommandMenuWrapper';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

jest.mock(
  '@/object-record/record-index/hooks/useFindManyRecordIndexTableParams',
  () => ({
    useFindManyRecordIndexTableParams: () => ({
      filter: { city: { eq: 'Paris' } },
      orderBy: [{ city: 'AscNullsFirst' }],
    }),
  }),
);

jest.mock(
  '@/object-record/object-options-dropdown/hooks/useObjectOptionsForBoard',
  () => ({
    useObjectOptionsForBoard: () => ({ hiddenBoardFields: [] }),
  }),
);

describe('useRecordIndexExportParameters', () => {
  const objectMetadataItem = getMockObjectMetadataItemOrThrow('person');
  const name = objectMetadataItem.fields.find(
    (field) => field.name === 'name',
  )!;
  const city = objectMetadataItem.fields.find(
    (field) => field.name === 'city',
  )!;
  const email = objectMetadataItem.fields.find(
    (field) => field.name === 'emails',
  )!;

  const exportParameters = (selection: ContextStoreTargetedRecordsRule) => {
    const wrapper = getJestMetadataAndApolloMocksAndCommandMenuWrapper({
      apolloMocks: [],
      componentInstanceId: 'recordIndexId',
      contextStoreTargetedRecordsRule: selection,
      contextStoreCurrentObjectMetadataNameSingular: 'person',
      onInitializeJotaiStore: (store) => {
        store.set(
          currentRecordFieldsComponentState.atomFamily({
            instanceId: 'recordIndexId',
          }),
          [
            {
              id: 'name-column',
              fieldMetadataItemId: name.id,
              position: 1,
              isVisible: true,
              size: 100,
            },
            {
              id: 'city-column',
              fieldMetadataItemId: city.id,
              position: 0,
              isVisible: true,
              size: 100,
            },
            {
              id: 'email-column',
              fieldMetadataItemId: email.id,
              position: 2,
              isVisible: false,
              size: 100,
            },
          ],
        );
      },
    });
    return renderHook(
      () =>
        useRecordIndexExportParameters({
          objectMetadataItem,
          recordIndexId: 'recordIndexId',
        }),
      { wrapper },
    ).result;
  };

  it('captures the current view filter, sort and visible column order', () => {
    const result = exportParameters({
      mode: 'selection',
      selectedRecordIds: [],
    });
    expect(result.current).toEqual({
      objectMetadataId: objectMetadataItem.id,
      filter: { city: { eq: 'Paris' } },
      orderBy: [{ city: 'AscNullsFirst' }],
      fieldMetadataIds: [city.id, name.id],
    });
  });

  it('exports only explicitly selected records', () => {
    const result = exportParameters({
      mode: 'selection',
      selectedRecordIds: ['first', 'second'],
    });
    expect(result.current.filter).toEqual({ id: { in: ['first', 'second'] } });
  });

  it('preserves exclusions when all records are selected', () => {
    const result = exportParameters({
      mode: 'exclusion',
      excludedRecordIds: ['excluded'],
    });
    expect(result.current.filter).toEqual({
      and: expect.arrayContaining([{ not: { id: { in: ['excluded'] } } }]),
    });
  });
});
