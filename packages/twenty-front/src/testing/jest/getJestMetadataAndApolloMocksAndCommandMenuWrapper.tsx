import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { type MockedResponse } from '@apollo/client/testing';
import { type ReactNode } from 'react';
import type { Store } from 'jotai/vanilla/store';
import { isDefined } from 'twenty-shared/utils';
import {
  JestContextStoreSetter,
  type JestContextStoreSetterMocks,
} from '~/testing/jest/JestContextStoreSetter';
import { JestRecordIndexContextProviderWrapper } from '~/testing/jest/JestRecordIndexContextProviderWrapper';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

export type GetJestMetadataAndApolloMocksAndCommandMenuWrapperProps = {
  apolloMocks:
    | readonly MockedResponse<Record<string, any>, Record<string, any>>[]
    | undefined;
  onInitializeJotaiStore?: (store: Store) => void;
  componentInstanceId: string;
} & JestContextStoreSetterMocks;

export const getJestMetadataAndApolloMocksAndCommandMenuWrapper = ({
  apolloMocks,
  onInitializeJotaiStore,
  contextStoreTargetedRecordsRule,
  contextStoreCurrentViewId,
  contextStoreCurrentViewType,
  contextStoreNumberOfSelectedRecords,
  contextStoreCurrentObjectMetadataNameSingular,
  contextStoreFilters,
  componentInstanceId,
}: GetJestMetadataAndApolloMocksAndCommandMenuWrapperProps) => {
  const Wrapper = getJestMetadataAndApolloMocksWrapper({
    apolloMocks,
    onInitializeJotaiStore,
  });

  const mockObjectMetadataItem = getMockObjectMetadataItemOrThrow(
    contextStoreCurrentObjectMetadataNameSingular ?? '',
  );

  if (!isDefined(mockObjectMetadataItem)) {
    throw new Error(
      `Mock object metadata item ${contextStoreCurrentObjectMetadataNameSingular} not found`,
    );
  }

  return ({ children }: { children: ReactNode }) => (
    <Wrapper>
      <ContextStoreComponentInstanceContext.Provider
        value={{ instanceId: componentInstanceId }}
      >
        <CommandMenuComponentInstanceContext.Provider
          value={{
            instanceId: componentInstanceId,
          }}
        >
          <JestRecordIndexContextProviderWrapper
            objectMetadataItem={mockObjectMetadataItem}
          >
            <JestContextStoreSetter
              contextStoreCurrentViewId={contextStoreCurrentViewId}
              contextStoreFilters={contextStoreFilters}
              contextStoreTargetedRecordsRule={contextStoreTargetedRecordsRule}
              contextStoreNumberOfSelectedRecords={
                contextStoreNumberOfSelectedRecords
              }
              contextStoreCurrentObjectMetadataNameSingular={
                contextStoreCurrentObjectMetadataNameSingular
              }
              contextStoreCurrentViewType={contextStoreCurrentViewType}
            >
              {children}
            </JestContextStoreSetter>
          </JestRecordIndexContextProviderWrapper>
        </CommandMenuComponentInstanceContext.Provider>
      </ContextStoreComponentInstanceContext.Provider>
    </Wrapper>
  );
};
