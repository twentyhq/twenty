import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { RecordComponentInstanceContextsWrapper } from '@/object-record/components/RecordComponentInstanceContextsWrapper';
import { RecordIndexContextProvider } from '@/object-record/record-index/contexts/RecordIndexContext';
import { type MockedResponse } from '@apollo/client/testing';
import { type ReactNode } from 'react';
import { type MutableSnapshot } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import {
  JestContextStoreSetter,
  type JestContextStoreSetterMocks,
} from '~/testing/jest/JestContextStoreSetter';
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
      <RecordComponentInstanceContextsWrapper
        componentInstanceId={componentInstanceId}
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
                objectPermissionsByObjectMetadataId: {},
                indexIdentifierUrl: () => 'indexIdentifierUrl',
                onIndexRecordsLoaded: () => {},
                objectNamePlural: mockObjectMetadataItem.namePlural,
                objectNameSingular: mockObjectMetadataItem.nameSingular,
                objectMetadataItem: mockObjectMetadataItem,
                recordIndexId: 'recordIndexId',
              }}
            >
              <JestContextStoreSetter
                contextStoreCurrentViewId={contextStoreCurrentViewId}
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
                contextStoreCurrentViewType={contextStoreCurrentViewType}
              >
                {children}
              </JestContextStoreSetter>
            </RecordIndexContextProvider>
          </ActionMenuComponentInstanceContext.Provider>
        </ContextStoreComponentInstanceContext.Provider>
      </RecordComponentInstanceContextsWrapper>
    </Wrapper>
  );
};
