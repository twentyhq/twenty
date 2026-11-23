import { renderHook } from '@testing-library/react';

import { contextStoreRecordShowParentViewComponentState } from '@/context-store/states/contextStoreRecordShowParentViewComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useQueryVariablesFromParentView } from '@/views/hooks/useQueryVariablesFromParentView';
import { ViewFilterOperand } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const COMPANY_RECORD_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';

// The context store instance getJestMetadataAndApolloMocksWrapper binds, which the hook reads
const CONTEXT_STORE_INSTANCE_ID = 'instanceId';

const personObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');
const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');

const companyRelationFieldMetadataItem = personObjectMetadataItem.fields.find(
  (field) => field.name === 'company',
);

if (!isDefined(companyRelationFieldMetadataItem)) {
  throw new Error('Missing "company" field on the person object');
}

const companyRecordFilter: RecordFilter = {
  id: 'record-filter-1',
  fieldMetadataId: companyRelationFieldMetadataItem.id,
  operand: ViewFilterOperand.IS,
  value: JSON.stringify({
    isCurrentWorkspaceMemberSelected: false,
    isCurrentRecordSelected: false,
    selectedRecordIds: [COMPANY_RECORD_ID],
  }),
  displayValue: 'Acme',
  type: 'RELATION',
  label: 'Company',
};

const renderUseQueryVariablesFromParentView = (
  objectMetadataItem: EnrichedObjectMetadataItem,
) =>
  renderHook(() => useQueryVariablesFromParentView({ objectMetadataItem }), {
    wrapper: getJestMetadataAndApolloMocksWrapper({
      apolloMocks: [],
      onInitializeJotaiStore: (store) => {
        store.set(
          contextStoreRecordShowParentViewComponentState.atomFamily({
            instanceId: CONTEXT_STORE_INSTANCE_ID,
          }),
          {
            parentViewComponentId: 'record-index-people',
            parentViewObjectNameSingular: personObjectMetadataItem.nameSingular,
            parentViewFilterGroups: [],
            parentViewFilters: [companyRecordFilter],
            parentViewSorts: [],
          },
        );
      },
    }),
  });

describe('useQueryVariablesFromParentView', () => {
  it('should compute the filter when the parent view targets the same object', () => {
    const { result } = renderUseQueryVariablesFromParentView(
      personObjectMetadataItem,
    );

    expect(result.current.filter).toEqual({
      companyId: { in: [COMPANY_RECORD_ID] },
    });
  });

  it('should ignore the parent view when it targets another object', () => {
    const { result } = renderUseQueryVariablesFromParentView(
      companyObjectMetadataItem,
    );

    expect(result.current.filter).toEqual({});
  });
});
