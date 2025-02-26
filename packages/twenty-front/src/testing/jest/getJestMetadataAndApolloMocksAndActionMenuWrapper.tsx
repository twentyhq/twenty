import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { ContextStoreTargetedRecordsRule } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { RecordFilterGroupsComponentInstanceContext } from '@/object-record/record-filter-group/states/context/RecordFilterGroupsComponentInstanceContext';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { RecordIndexContextProvider } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RecordSortsComponentInstanceContext } from '@/object-record/record-sort/states/context/RecordSortsComponentInstanceContext';
import { MockedResponse } from '@apollo/client/testing';
import { ReactNode } from 'react';
import { MutableSnapshot } from 'recoil';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { JestContextStoreSetter } from '~/testing/jest/JestContextStoreSetter';

export type GetJestMetadataAndApolloMocksAndActionMenuWrapperProps = {
  apolloMocks:
    | readonly MockedResponse<Record<string, any>, Record<string, any>>[]
    | undefined;
  onInitializeRecoilSnapshot?: (snapshot: MutableSnapshot) => void;
  contextStoreTargetedRecordsRule?: ContextStoreTargetedRecordsRule;
  contextStoreNumberOfSelectedRecords?: number;
  contextStoreCurrentObjectMetadataNameSingular?: string;
  componentInstanceId: string;
};

export const getJestMetadataAndApolloMocksAndActionMenuWrapper = ({
  apolloMocks,
  onInitializeRecoilSnapshot,
  contextStoreTargetedRecordsRule,
  contextStoreNumberOfSelectedRecords,
  contextStoreCurrentObjectMetadataNameSingular,
  componentInstanceId,
}: GetJestMetadataAndApolloMocksAndActionMenuWrapperProps) => {
  const Wrapper = getJestMetadataAndApolloMocksWrapper({
    apolloMocks,
    onInitializeRecoilSnapshot,
  });

  return ({ children }: { children: ReactNode }) => (
    <Wrapper>
      <RecordFilterGroupsComponentInstanceContext.Provider
        value={{ instanceId: componentInstanceId }}
      >
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
      </RecordFilterGroupsComponentInstanceContext.Provider>
    </Wrapper>
  );
};
