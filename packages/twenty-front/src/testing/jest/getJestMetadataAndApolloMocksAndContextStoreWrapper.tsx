import { ContextStoreTargetedRecordsRule } from '@/context-store/states/contextStoreTargetedRecordsRuleState';
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
}: {
  apolloMocks:
    | readonly MockedResponse<Record<string, any>, Record<string, any>>[]
    | undefined;
  onInitializeRecoilSnapshot?: (snapshot: MutableSnapshot) => void;
  contextStoreTargetedRecordsRule?: ContextStoreTargetedRecordsRule;
  contextStoreCurrentObjectMetadataNameSingular?: string;
}) => {
  const Wrapper = getJestMetadataAndApolloMocksWrapper({
    apolloMocks,
    onInitializeRecoilSnapshot,
  });
  return ({ children }: { children: ReactNode }) => (
    <Wrapper>
      <JestContextStoreSetter
        contextStoreTargetedRecordsRule={contextStoreTargetedRecordsRule}
        contextStoreCurrentObjectMetadataNameSingular={
          contextStoreCurrentObjectMetadataNameSingular
        }
      >
        {children}
      </JestContextStoreSetter>
    </Wrapper>
  );
};
