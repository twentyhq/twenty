import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { type MockedResponse } from '@apollo/client/testing';
import { type ReactNode } from 'react';
import { type MutableSnapshot } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import {
  TestContextStoreSetter,
  type TestContextStoreSetterMocks,
} from '~/testing/test-helpers/TestContextStoreSetter';
import { TestRecordIndexContextProviderWrapper } from '~/testing/test-helpers/TestRecordIndexContextProviderWrapper';
import { getTestMetadataAndApolloMocksWrapper } from '~/testing/test-helpers/getTestMetadataAndApolloMocksWrapper';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

export type GetTestMetadataAndApolloMocksAndActionMenuWrapperProps = {
  apolloMocks:
    | readonly MockedResponse<Record<string, any>, Record<string, any>>[]
    | undefined;
  onInitializeRecoilSnapshot?: (snapshot: MutableSnapshot) => void;
  componentInstanceId: string;
} & TestContextStoreSetterMocks;

export const getTestMetadataAndApolloMocksAndActionMenuWrapper = ({
  apolloMocks,
  onInitializeRecoilSnapshot,
  contextStoreTargetedRecordsRule,
  contextStoreCurrentViewId,
  contextStoreCurrentViewType,
  contextStoreNumberOfSelectedRecords,
  contextStoreCurrentObjectMetadataNameSingular,
  contextStoreFilters,
  componentInstanceId,
}: GetTestMetadataAndApolloMocksAndActionMenuWrapperProps) => {
  const Wrapper = getTestMetadataAndApolloMocksWrapper({
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
          <TestRecordIndexContextProviderWrapper
            objectMetadataItem={mockObjectMetadataItem}
          >
            <TestContextStoreSetter
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
            </TestContextStoreSetter>
          </TestRecordIndexContextProviderWrapper>
        </ActionMenuComponentInstanceContext.Provider>
      </ContextStoreComponentInstanceContext.Provider>
    </Wrapper>
  );
};
