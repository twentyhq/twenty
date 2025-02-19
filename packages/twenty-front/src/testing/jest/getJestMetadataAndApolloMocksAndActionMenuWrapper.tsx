import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { RecordIndexContextProvider } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RecordSortsComponentInstanceContext } from '@/object-record/record-sort/states/context/RecordSortsComponentInstanceContext';
import { MockedResponse } from '@apollo/client/testing';
import { ReactNode } from 'react';
import { MutableSnapshot } from 'recoil';
import { isDefined } from 'twenty-shared';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import {
  JestContextStoreSetter,
  JestContextStoreSetterMocks,
} from '~/testing/jest/JestContextStoreSetter';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';

export type GetJestMetadataAndApolloMocksAndActionMenuWrapperProps = {
  apolloMocks:
    | readonly MockedResponse<Record<string, any>, Record<string, any>>[]
    | undefined;
  onInitializeRecoilSnapshot?: (snapshot: MutableSnapshot) => void;
  componentInstanceId: string;
} & JestContextStoreSetterMocks;

export const getJestMetadataAndApolloMocksAndActionMenuWrapper = ({
  apolloMocks,
  onInitializeRecoilSnapshot,
  contextStoreTargetedRecordsRule,
  contextStoreNumberOfSelectedRecords,
  contextStoreCurrentObjectMetadataNameSingular,
  contextStoreFilters,
  componentInstanceId,
}: GetJestMetadataAndApolloMocksAndActionMenuWrapperProps) => {
  const Wrapper = getJestMetadataAndApolloMocksWrapper({
    apolloMocks,
    onInitializeRecoilSnapshot,
  });

  const mockObjectMetadataItem = generatedMockObjectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular ===
      contextStoreCurrentObjectMetadataNameSingular,
  );

  if (!isDefined(mockObjectMetadataItem)) {
    throw new Error(
      `Mock object metadata item ${contextStoreCurrentObjectMetadataNameSingular} not found`,
    );
  }

  return ({ children }: { children: ReactNode }) => (
    <Wrapper>
      <RecordFiltersComponentInstanceContext.Provider
        value={{
          instanceId: componentInstanceId,
        }}
      >
        <RecordSortsComponentInstanceContext.Provider
          value={{ instanceId: componentInstanceId }}
        >
          <ContextStoreComponentInstanceContext.Provider
            value={{ instanceId: componentInstanceId }}
          >
            <ActionMenuComponentInstanceContext.Provider
              value={{
                instanceId: componentInstanceId,
              }}
            >
              <RecordIndexContextProvider
                value={{
                  indexIdentifierUrl: () => 'indexIdentifierUrl',
                  onIndexRecordsLoaded: () => {},
                  objectNamePlural: mockObjectMetadataItem.namePlural,
                  objectNameSingular: mockObjectMetadataItem.nameSingular,
                  objectMetadataItem: mockObjectMetadataItem,
                  recordIndexId: 'recordIndexId',
                }}
              >
                <JestContextStoreSetter
                  contextStoreFilters={contextStoreFilters}
                  contextStoreTargetedRecordsRule={
                    contextStoreTargetedRecordsRule
                  }
                  contextStoreNumberOfSelectedRecords={
                    contextStoreNumberOfSelectedRecords
                  }
                  contextStoreCurrentObjectMetadataNameSingular={
                    contextStoreCurrentObjectMetadataNameSingular
                  }
                >
                  {children}
                </JestContextStoreSetter>
              </RecordIndexContextProvider>
            </ActionMenuComponentInstanceContext.Provider>
          </ContextStoreComponentInstanceContext.Provider>
        </RecordSortsComponentInstanceContext.Provider>
      </RecordFiltersComponentInstanceContext.Provider>
    </Wrapper>
  );
};
