import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { ContextStoreTargetedRecordsRule } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
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
      <ContextStoreComponentInstanceContext.Provider
        value={{ instanceId: componentInstanceId }}
      >
        <ActionMenuComponentInstanceContext.Provider
          value={{ instanceId: componentInstanceId }}
        >
          <JestContextStoreSetter
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
    </Wrapper>
  );
};
