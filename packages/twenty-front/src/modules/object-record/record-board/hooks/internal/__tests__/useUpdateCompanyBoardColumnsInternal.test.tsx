import { act, renderHook } from '@testing-library/react';
import { RecoilRoot, useRecoilValue } from 'recoil';

import { CompanyForBoard } from '@/companies/types/CompanyProgress';
import { useRecordBoardScopedStates } from '@/object-record/record-board/hooks/internal/useRecordBoardScopedStates';
import { useUpdateCompanyBoardColumnsInternal } from '@/object-record/record-board/hooks/internal/useUpdateCompanyBoardColumnsInternal';
import { RecordBoardScope } from '@/object-record/record-board/scopes/RecordBoardScope';
import { recordBoardCardIdsByColumnIdFamilyState } from '@/object-record/record-board/states/recordBoardCardIdsByColumnIdFamilyState';
import { currentPipelineStepsState } from '@/pipeline/states/currentPipelineStepsState';
import { Opportunity } from '@/pipeline/types/Opportunity';
import { PipelineStep } from '@/pipeline/types/PipelineStep';

const scopeId = 'scopeId';
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <RecordBoardScope recordBoardScopeId={scopeId}>
    <RecoilRoot>{children}</RecoilRoot>
  </RecordBoardScope>
);

describe('useUpdateCompanyBoardColumnsInternal', () => {
  it('should update recoil state after updateCompanyBoardColumns call ', async () => {
    const { result } = renderHook(
      () => {
        return {
          updateCompanyBoardColumns: useUpdateCompanyBoardColumnsInternal(),
          currentPipeline: useRecoilValue(currentPipelineStepsState),
          boardColumns: useRecoilValue(
            useRecordBoardScopedStates().boardColumnsState,
          ),
          savedBoardColumns: useRecoilValue(
            useRecordBoardScopedStates().savedBoardColumnsState,
          ),
          idsByColumnId: useRecoilValue(
            recordBoardCardIdsByColumnIdFamilyState('1'),
          ),
        };
      },
      {
        wrapper: Wrapper,
      },
    );

    const pipelineSteps: PipelineStep[] = [
      {
        id: '1',
        name: 'Step 1',
        color: 'red',
        position: 1,
        createdAt: '2024-01-12',
        updatedAt: '2024-01-12',
      },
      {
        id: '2',
        name: 'Step 2',
        color: 'blue',
        position: 1,
        createdAt: '2024-01-12',
        updatedAt: '2024-01-12',
      },
    ];
    const opportunity: Opportunity = {
      id: '123',
      amount: {
        amountMicros: 1000000,
        currencyCode: 'USD',
      },
      closeDate: new Date('2024-02-01'),
      probability: 0.75,
      pipelineStepId: '1',
      pipelineStep: pipelineSteps[0],
      pointOfContactId: '456',
      pointOfContact: {
        id: '456',
        name: {
          firstName: 'John',
          lastName: 'Doe',
        },
        avatarUrl: 'https://example.com/avatar.jpg',
      },
    };

    const companyForBoard: CompanyForBoard = {
      id: '789',
      name: 'Acme Inc.',
      domainName: 'acme.com',
    };

    expect(result.current.currentPipeline).toStrictEqual([]);
    expect(result.current.savedBoardColumns).toStrictEqual([]);
    expect(result.current.boardColumns).toStrictEqual([]);
    expect(result.current.idsByColumnId).toStrictEqual([]);

    act(() => {
      result.current.updateCompanyBoardColumns(
        pipelineSteps,
        [opportunity],
        [companyForBoard],
      );
    });

    const expectedBoardColumns = [
      { id: '1', title: 'Step 1', colorCode: 'red', position: 1 },
      { id: '2', title: 'Step 2', colorCode: 'blue', position: 1 },
    ];

    expect(result.current.currentPipeline).toStrictEqual(pipelineSteps);
    expect(result.current.savedBoardColumns).toStrictEqual(
      expectedBoardColumns,
    );
    expect(result.current.boardColumns).toStrictEqual(expectedBoardColumns);
    expect(result.current.idsByColumnId).toStrictEqual([opportunity.id]);
  });
});
