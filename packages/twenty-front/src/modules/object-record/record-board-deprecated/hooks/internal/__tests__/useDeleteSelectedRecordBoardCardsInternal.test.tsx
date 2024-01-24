import { MockedProvider } from '@apollo/client/testing';
import { act, renderHook, waitFor } from '@testing-library/react';
import gql from 'graphql-tag';
import { RecoilRoot, useRecoilValue, useSetRecoilState } from 'recoil';

import { BoardCardIdContext } from '@/object-record/record-board-deprecated/contexts/BoardCardIdContext';
import { useCreateOpportunity } from '@/object-record/record-board-deprecated/hooks/internal/useCreateOpportunity';
import { useCurrentRecordBoardDeprecatedCardSelectedInternal } from '@/object-record/record-board-deprecated/hooks/internal/useCurrentRecordBoardDeprecatedCardSelectedInternal';
import { useDeleteSelectedRecordBoardDeprecatedCardsInternal } from '@/object-record/record-board-deprecated/hooks/internal/useDeleteSelectedRecordBoardDeprecatedCardsInternal';
import { useRecordBoardDeprecatedScopedStates } from '@/object-record/record-board-deprecated/hooks/internal/useRecordBoardDeprecatedScopedStates';
import { RecordBoardDeprecatedScope } from '@/object-record/record-board-deprecated/scopes/RecordBoardDeprecatedScope';
import { recordBoardCardIdsByColumnIdFamilyState } from '@/object-record/record-board-deprecated/states/recordBoardCardIdsByColumnIdFamilyState';

jest.mock('@/object-metadata/hooks/useMapFieldMetadataToGraphQLQuery', () => ({
  useMapFieldMetadataToGraphQLQuery: jest.fn().mockReturnValue(() => '\n'),
}));

const mockedUuid = 'mocked-uuid';
jest.mock('uuid', () => ({ v4: () => mockedUuid }));

const mocks = [
  {
    request: {
      query: gql`
        mutation DeleteManyOpportunities($filter: OpportunityFilterInput!) {
          deleteOpportunities(filter: $filter) {
            id
          }
        }
      `,
      variables: { filter: { id: { in: [mockedUuid] } } },
    },
    result: jest.fn(() => ({
      data: { deleteOpportunities: { id: '' } },
    })),
  },
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
          name: 'Opportunity',
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

const scopeId = 'scopeId';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <MockedProvider mocks={mocks} addTypename={false}>
    <RecordBoardDeprecatedScope recordBoardScopeId={scopeId}>
      <BoardCardIdContext.Provider value={mockedUuid}>
        <RecoilRoot>{children}</RecoilRoot>
      </BoardCardIdContext.Provider>
    </RecordBoardDeprecatedScope>
  </MockedProvider>
);

describe('useDeleteSelectedRecordBoardDeprecatedCardsInternal', () => {
  it('should run apollo mutation and update recoil state when delete selected cards', async () => {
    const companyIdname = 'New Opportunity';
    const opportunityPipelineStepId = 'pipelineStepId';

    const { result } = renderHook(
      () => ({
        createOpportunity: useCreateOpportunity(),
        deleteSelectedCards:
          useDeleteSelectedRecordBoardDeprecatedCardsInternal(),
        setBoardColumns: useSetRecoilState(
          useRecordBoardDeprecatedScopedStates({
            recordBoardScopeId: scopeId,
          }).boardColumnsState,
        ),
        recordBoardCardIdsByColumnId: useRecoilValue(
          recordBoardCardIdsByColumnIdFamilyState(opportunityPipelineStepId),
        ),
        currentSelect: useCurrentRecordBoardDeprecatedCardSelectedInternal(),
      }),
      {
        wrapper: Wrapper,
      },
    );

    act(() => {
      result.current.currentSelect.setCurrentCardSelected(true);
      result.current.setBoardColumns([
        {
          id: opportunityPipelineStepId,
          title: '1',
          position: 1,
        },
      ]);
      result.current.createOpportunity(
        companyIdname,
        opportunityPipelineStepId,
      );
    });

    expect(result.current.recordBoardCardIdsByColumnId).toStrictEqual([
      mockedUuid,
    ]);
    await act(async () => {
      await result.current.deleteSelectedCards();
    });

    await waitFor(() => {
      expect(result.current.recordBoardCardIdsByColumnId).toStrictEqual([]);
      expect(mocks[0].result).toHaveBeenCalled();
    });
  });
});
