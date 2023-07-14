import { useEffect } from 'react';
import { useRecoilCallback, useRecoilState } from 'recoil';

import { useCompanyBoardIndex } from '@/companies/hooks/useCompanyBoardIndex';
import { CompanyProgress } from '@/companies/types/CompanyProgress';
import { Pipeline, useGetPipelinesQuery } from '~/generated/graphql';

import { companyBoardIndexState } from './companyBoardIndexState';
import { currentPipelineState } from './currentPipelineState';

export function HookCompanyBoard() {
  const [currentPipeline, setCurrentPipeline] =
    useRecoilState(currentPipelineState);

  useGetPipelinesQuery({
    onCompleted: (data) => {
      setCurrentPipeline(data?.findManyPipeline[0] as Pipeline);
    },
  });

  const { companyBoardIndex, loading } = useCompanyBoardIndex(currentPipeline);

  const synchronizeCompanyProgresses = useRecoilCallback(
    ({ set }) =>
      (companyBoardIndex: { [key: string]: CompanyProgress }) => {
        Object.entries(companyBoardIndex).forEach(([id, companyProgress]) => {
          set(companyBoardIndexState(id), companyProgress);
        });
      },
    [],
  );

  useEffect(() => {
    !loading && synchronizeCompanyProgresses(companyBoardIndex);
  }, [loading, companyBoardIndex, synchronizeCompanyProgresses]);

  return <></>;
}
