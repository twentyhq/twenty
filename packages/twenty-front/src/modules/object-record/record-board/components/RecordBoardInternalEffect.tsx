import { useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { useObjectRecordBoard } from '@/object-record/hooks/useObjectRecordBoard';
import { useRecordBoardActionBarEntriesInternal } from '@/object-record/record-board/hooks/internal/useRecordBoardActionBarEntriesInternal';
import { useRecordBoardContextMenuEntriesInternal } from '@/object-record/record-board/hooks/internal/useRecordBoardContextMenuEntriesInternal';
import { useRecordBoardScopedStates } from '@/object-record/record-board/hooks/internal/useRecordBoardScopedStates';
import { useUpdateCompanyBoardColumnsInternal } from '@/object-record/record-board/hooks/internal/useUpdateCompanyBoardColumnsInternal';
import { isDefined } from '~/utils/isDefined';

export type RecordBoardInternalEffectProps = {
  onFieldsChange: (fields: any) => void;
};

export const RecordBoardInternalEffect = () => {
  const updateCompanyColumnsBoardInternal =
    useUpdateCompanyBoardColumnsInternal();
  const { setActionBarEntries } = useRecordBoardActionBarEntriesInternal();
  const { setContextMenuEntries } = useRecordBoardContextMenuEntriesInternal();

  const {
    savedPipelineStepsState,
    savedOpportunitiesState,
    savedCompaniesState,
  } = useRecordBoardScopedStates();

  const { fetchMoreOpportunities, fetchMoreCompanies, opportunities } =
    useObjectRecordBoard();

  const [savedOpportunities, setSavedOpportunities] = useRecoilState(
    savedOpportunitiesState,
  );
  const savedPipelineSteps = useRecoilValue(savedPipelineStepsState);
  const savedCompanies = useRecoilValue(savedCompaniesState);

  useEffect(() => {
    setSavedOpportunities(opportunities);
  }, [opportunities, setSavedOpportunities]);

  useEffect(() => {
    if (isDefined(fetchMoreOpportunities)) {
      fetchMoreOpportunities();
    }
  }, [fetchMoreOpportunities]);

  useEffect(() => {
    if (isDefined(fetchMoreCompanies)) {
      fetchMoreCompanies();
    }
  }, [fetchMoreCompanies]);

  useEffect(() => {
    if (savedOpportunities && savedCompanies) {
      setActionBarEntries();
      setContextMenuEntries();

      updateCompanyColumnsBoardInternal(
        savedPipelineSteps,
        savedOpportunities,
        savedCompanies,
      );
    }
  }, [
    savedCompanies,
    savedOpportunities,
    savedPipelineSteps,
    setActionBarEntries,
    setContextMenuEntries,
    updateCompanyColumnsBoardInternal,
  ]);

  return <></>;
};
