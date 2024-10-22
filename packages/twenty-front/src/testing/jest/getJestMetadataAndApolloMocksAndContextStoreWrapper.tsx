import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { ContextStoreTargetedRecordsRule } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { MockedResponse } from '@apollo/client/testing';
import { ReactNode } from 'react';
import { MutableSnapshot } from 'recoil';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { JestContextStoreSetter } from '~/testing/jest/JestContextStoreSetter';

export const getJestMetadataAndApolloMocksAndContextStoreWrapper = ({
  apolloMocks,
  onInitializeRecoilSnapshot,
  contextStoreTargetedRecordsRule,
  contextStoreCurrentObjectMetadataNameSingular,
  componentInstanceId,
}: {
  apolloMocks:
    | readonly MockedResponse<Record<string, any>, Record<string, any>>[]
    | undefined;
  onInitializeRecoilSnapshot?: (snapshot: MutableSnapshot) => void;
  contextStoreTargetedRecordsRule?: ContextStoreTargetedRecordsRule;
  contextStoreCurrentObjectMetadataNameSingular?: string;
  componentInstanceId: string;
}) => {
  const Wrapper = getJestMetadataAndApolloMocksWrapper({
    apolloMocks,
    onInitializeRecoilSnapshot,
  });
  return ({ children }: { children: ReactNode }) => (
    <Wrapper>
      <ContextStoreComponentInstanceContext.Provider
        value={{
          instanceId: componentInstanceId,
        }}
      >
        <JestContextStoreSetter
          contextStoreTargetedRecordsRule={contextStoreTargetedRecordsRule}
          contextStoreCurrentObjectMetadataNameSingular={
            contextStoreCurrentObjectMetadataNameSingular
          }
        >
          {children}
        </JestContextStoreSetter>
      </ContextStoreComponentInstanceContext.Provider>
    </Wrapper>
  );
};
