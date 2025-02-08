import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { MockedResponse } from '@apollo/client/testing';
import { ReactNode } from 'react';
import { MutableSnapshot } from 'recoil';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import {
  JestContextStoreSetter,
  JestContextStoreSetterMocks,
} from '~/testing/jest/JestContextStoreSetter';

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

  return ({ children }: { children: ReactNode }) => (
    <Wrapper>
      <RecordFiltersComponentInstanceContext.Provider
        value={{
          instanceId: componentInstanceId,
        }}
      >
        <ContextStoreComponentInstanceContext.Provider
          value={{ instanceId: componentInstanceId }}
        >
          <ActionMenuComponentInstanceContext.Provider
            value={{
              instanceId: componentInstanceId,
            }}
          >
            <JestContextStoreSetter
              contextStoreFilters={contextStoreFilters}
              contextStoreTargetedRecordsRule={contextStoreTargetedRecordsRule}
              contextStoreNumberOfSelectedRecords={
                contextStoreNumberOfSelectedRecords
              }
              contextStoreCurrentObjectMetadataNameSingular={
                contextStoreCurrentObjectMetadataNameSingular
              }
            >
              {children}
            </JestContextStoreSetter>
          </ActionMenuComponentInstanceContext.Provider>
        </ContextStoreComponentInstanceContext.Provider>
      </RecordFiltersComponentInstanceContext.Provider>
    </Wrapper>
  );
};
