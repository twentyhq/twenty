import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { type MockedResponse } from '@apollo/client/testing';
import { type ReactNode } from 'react';
import { type MutableSnapshot } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import {
  JestContextStoreSetter,
  type JestContextStoreSetterMocks,
} from '~/testing/jest/JestContextStoreSetter';
import { JestRecordIndexContextProviderWrapper } from '~/testing/jest/JestRecordIndexContextProviderWrapper';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

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
  contextStoreCurrentViewId,
  contextStoreCurrentViewType,
  contextStoreNumberOfSelectedRecords,
  contextStoreCurrentObjectMetadataNameSingular,
  contextStoreFilters,
  componentInstanceId,
}: GetJestMetadataAndApolloMocksAndActionMenuWrapperProps) => {
  const Wrapper = getJestMetadataAndApolloMocksWrapper({
    apolloMocks,
    onInitializeRecoilSnapshot,
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
        <ActionMenuComponentInstanceContext.Provider
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
        </ActionMenuComponentInstanceContext.Provider>
      </ContextStoreComponentInstanceContext.Provider>
    </Wrapper>
  );
};
