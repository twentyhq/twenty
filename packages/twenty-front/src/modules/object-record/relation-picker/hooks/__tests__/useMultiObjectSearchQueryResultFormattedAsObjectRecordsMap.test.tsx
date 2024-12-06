import { act, renderHook } from '@testing-library/react';
import { RecoilRoot, useSetRecoilState } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useMultiObjectSearchQueryResultFormattedAsObjectRecordsMap } from '@/object-record/relation-picker/hooks/useMultiObjectSearchQueryResultFormattedAsObjectRecordsMap';
import { RecordPickerComponentInstanceContext } from '@/object-record/relation-picker/states/contexts/RecordPickerComponentInstanceContext';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';

const instanceId = 'instanceId';
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <RecordPickerComponentInstanceContext.Provider value={{ instanceId }}>
    <RecoilRoot>{children}</RecoilRoot>
  </RecordPickerComponentInstanceContext.Provider>
);

const opportunityId = 'cb702502-4b1d-488e-9461-df3fb096ebf6';
const personId = 'ab091fd9-1b81-4dfd-bfdb-564ffee032a2';

describe('useMultiObjectRecordsQueryResultFormattedAsObjectRecordsMap', () => {
  it('should return object formatted from objectMetadataItemsState', async () => {
    const { result } = renderHook(
      () => {
        return {
          formattedRecord:
            useMultiObjectSearchQueryResultFormattedAsObjectRecordsMap({
              multiObjectRecordsQueryResult: {
                opportunities: {
                  edges: [
                    {
                      node: {
                        id: opportunityId,
                        pointOfContactId:
                          'e992bda7-d797-4e12-af04-9b427f42244c',
                        updatedAt: '2023-11-30T11:13:15.308Z',
                        createdAt: '2023-11-30T11:13:15.308Z',
                        __typename: 'Opportunity',
                      },
                      cursor: 'cursor',
                      __typename: 'OpportunityEdge',
                    },
                  ],
                  pageInfo: {},
                },
                people: {
                  edges: [
                    {
                      node: {
                        id: personId,
                        updatedAt: '2023-11-30T11:13:15.308Z',
                        createdAt: '2023-11-30T11:13:15.308Z',
                        __typename: 'Person',
                      },
                      cursor: 'cursor',
                      __typename: 'PersonEdge',
                    },
                  ],
                  pageInfo: {},
                },
              },
            }),
          setObjectMetadata: useSetRecoilState(objectMetadataItemsState),
        };
      },
      {
        wrapper: Wrapper,
      },
    );
    act(() => {
      result.current.setObjectMetadata(generatedMockObjectMetadataItems);
    });

    expect(
      Object.values(result.current.formattedRecord.objectRecordsMap).flat()
        .length,
    ).toBe(2);

    const opportunityObjectRecords =
      result.current.formattedRecord.objectRecordsMap.opportunities;

    const personObjectRecords =
      result.current.formattedRecord.objectRecordsMap.people;

    expect(opportunityObjectRecords[0].objectMetadataItem.namePlural).toBe(
      'opportunities',
    );
    expect(opportunityObjectRecords[0].record.id).toBe(opportunityId);
    expect(opportunityObjectRecords[0].recordIdentifier.linkToShowPage).toBe(
      `/object/opportunity/${opportunityId}`,
    );

    expect(personObjectRecords[0].objectMetadataItem.namePlural).toBe('people');
    expect(personObjectRecords[0].record.id).toBe(personId);
    expect(personObjectRecords[0].recordIdentifier.linkToShowPage).toBe(
      `/object/person/${personId}`,
    );
  });
});
