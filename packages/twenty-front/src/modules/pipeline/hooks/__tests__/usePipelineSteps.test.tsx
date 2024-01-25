import { ReactNode } from 'react';
import { act } from 'react-dom/test-utils';
import { MockedProvider } from '@apollo/client/testing';
import { renderHook } from '@testing-library/react';
import { RecoilRoot, useSetRecoilState } from 'recoil';

import { BoardColumnDefinition } from '@/object-record/record-board-deprecated/types/BoardColumnDefinition';
import { currentPipelineState } from '@/pipeline/states/currentPipelineState';

import {
  currentPipelineId,
  deleteQuery,
  deleteResponseData,
  deleteVariables,
  mockId,
  query,
  responseData,
  variables,
} from '../__mocks__/usePipelineSteps';
import { usePipelineSteps } from '../usePipelineSteps';

const mocks = [
  {
    request: {
      query,
      variables,
    },
    result: jest.fn(() => ({
      data: {
        createPipelineStep: responseData,
      },
    })),
  },
  {
    request: {
      query: deleteQuery,
      variables: deleteVariables,
    },
    result: jest.fn(() => ({
      data: {
        deletePipelineStep: deleteResponseData,
      },
    })),
  },
];

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>
    <MockedProvider mocks={mocks} addTypename={false}>
      {children}
    </MockedProvider>
  </RecoilRoot>
);

jest.mock('uuid', () => ({
  v4: jest.fn(() => mockId),
}));

describe('usePipelineSteps', () => {
  it('should handlePipelineStepAdd successfully', async () => {
    const { result } = renderHook(
      () => {
        const setCurrentPipeline = useSetRecoilState(currentPipelineState);
        setCurrentPipeline({ id: currentPipelineId });
        return usePipelineSteps();
      },
      {
        wrapper: Wrapper,
      },
    );

    const boardColumn: BoardColumnDefinition = {
      id: 'columnId',
      title: 'Column Title',
      colorCode: 'yellow',
      position: 1,
    };

    await act(async () => {
      const res = await result.current.handlePipelineStepAdd(boardColumn);
      expect(res).toEqual(responseData);
    });
  });

  it('should handlePipelineStepDelete successfully', async () => {
    const { result } = renderHook(
      () => {
        const setCurrentPipeline = useSetRecoilState(currentPipelineState);
        setCurrentPipeline({ id: currentPipelineId });
        return usePipelineSteps();
      },
      {
        wrapper: Wrapper,
      },
    );

    const boardColumnId = 'columnId';

    await act(async () => {
      const res = await result.current.handlePipelineStepDelete(boardColumnId);
      expect(res).toEqual(deleteResponseData);
    });
  });
});
