import { MockedProvider } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';
import gql from 'graphql-tag';
import { RecoilRoot, useRecoilValue } from 'recoil';

import { useCreateOpportunity } from '@/object-record/record-board-deprecated/hooks/internal/useCreateOpportunity';
import { recordBoardCardIdsByColumnIdFamilyState } from '@/object-record/record-board-deprecated/states/recordBoardCardIdsByColumnIdFamilyState';

const mockedUuid = 'mocked-uuid';
jest.mock('uuid', () => ({
  v4: () => mockedUuid,
}));

jest.mock('@/object-metadata/hooks/useMapFieldMetadataToGraphQLQuery', () => ({
  useMapFieldMetadataToGraphQLQuery: () => () => '\n',
}));

const mocks = [
  {
    request: {
      query: gql`
        mutation CreateOneOpportunity($input: OpportunityCreateInput!) {
          createOpportunity(data: $input) {
            id
          }
        }
      `,
      variables: {
        input: {
          id: mockedUuid,
          pipelineStepId: 'pipelineStepId',
          companyId: 'New Opportunity',
        },
      },
    },
    result: jest.fn(() => ({
      data: { createOpportunity: { id: '' } },
    })),
  },
];

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <MockedProvider mocks={mocks} addTypename={false}>
    <RecoilRoot>{children}</RecoilRoot>
  </MockedProvider>
);

const renderHookConfig = {
  wrapper: Wrapper,
};

describe('useCreateOpportunity', () => {
  it('should create opportunity successfully', () => {
    const companyIdname = 'New Opportunity';
    const opportunityPipelineStepId = 'pipelineStepId';

    const { result } = renderHook(
      () => ({
        createOpportunity: useCreateOpportunity(),
        recordBoardCardIdsByColumnId: useRecoilValue(
          recordBoardCardIdsByColumnIdFamilyState(opportunityPipelineStepId),
        ),
      }),
      renderHookConfig,
    );

    act(() => {
      result.current.createOpportunity(
        companyIdname,
        opportunityPipelineStepId,
      );
    });

    expect(result.current.recordBoardCardIdsByColumnId).toStrictEqual([
      mockedUuid,
    ]);
  });
});
