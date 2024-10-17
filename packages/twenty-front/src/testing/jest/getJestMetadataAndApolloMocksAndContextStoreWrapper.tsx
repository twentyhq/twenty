import { MockedResponse } from '@apollo/client/testing';
import { ReactNode } from 'react';
import { MutableSnapshot } from 'recoil';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { JestContextStoreSetter } from '~/testing/jest/JestContextStoreSetter';

export const getJestMetadataAndApolloMocksAndContextStoreWrapper = ({
  apolloMocks,
  onInitializeRecoilSnapshot,
  contextStoreTargetedRecords,
  contextStoreCurrentObjectMetadataNameSingular,
  contextStoreTargetedRecordsFilters,
}: {
  apolloMocks:
    | readonly MockedResponse<Record<string, any>, Record<string, any>>[]
    | undefined;
  onInitializeRecoilSnapshot?: (snapshot: MutableSnapshot) => void;
  contextStoreTargetedRecords?: {
    selectedRecordIds: string[] | 'all';
    excludedRecordIds: string[];
  };
  contextStoreCurrentObjectMetadataNameSingular?: string;
  contextStoreTargetedRecordsFilters?: [];
}) => {
  const Wrapper = getJestMetadataAndApolloMocksWrapper({
    apolloMocks,
    onInitializeRecoilSnapshot,
  });
  return ({ children }: { children: ReactNode }) => (
    <Wrapper>
      <JestContextStoreSetter
        contextStoreTargetedRecords={contextStoreTargetedRecords}
        contextStoreCurrentObjectMetadataNameSingular={
          contextStoreCurrentObjectMetadataNameSingular
        }
        contextStoreTargetedRecordsFilters={contextStoreTargetedRecordsFilters}
      >
        {children}
      </JestContextStoreSetter>
    </Wrapper>
  );
};
