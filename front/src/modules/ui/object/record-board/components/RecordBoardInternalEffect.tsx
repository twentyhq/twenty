import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { useObjectRecordBoard } from '@/object-record/hooks/useObjectRecordBoard';
import { useBoardActionBarEntriesInternal } from '@/ui/object/record-board/hooks/internal/useBoardActionBarEntriesInternal';
import { useBoardContextMenuEntriesInternal } from '@/ui/object/record-board/hooks/internal/useBoardContextMenuEntriesInternal';
import { useRecordBoardScopedStates } from '@/ui/object/record-board/hooks/internal/useRecordBoardScopedStates';
import { useUpdateCompanyBoardColumnsInternal } from '@/ui/object/record-board/hooks/internal/useUpdateCompanyBoardColumnsInternal';
import { isDefined } from '~/utils/isDefined';

export type RecordBoardInternalEffectProps = {
  onFieldsChange: (fields: any) => void;
};

export const RecordBoardInternalEffect = ({}) => {
  const updateCompanyColumnsBoardInternal =
    useUpdateCompanyBoardColumnsInternal();
  const { setActionBarEntries } = useBoardActionBarEntriesInternal();
  const { setContextMenuEntries } = useBoardContextMenuEntriesInternal();

  const { fetchMoreOpportunities, fetchMoreCompanies } = useObjectRecordBoard();

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

  const {
    savedPipelineStepsState,
    savedOpportunitiesState,
    savedCompaniesState,
  } = useRecordBoardScopedStates();

  const savedPipelineSteps = useRecoilValue(savedPipelineStepsState);
  const savedOpportunities = useRecoilValue(savedOpportunitiesState);
  const savedCompanies = useRecoilValue(savedCompaniesState);

  useEffect(() => {
    if (savedOpportunities && savedCompanies) {
      setActionBarEntries();
      setContextMenuEntries();

      updateCompanyColumnsBoardInternal(
        savedPipelineSteps,
        savedOpportunities,
        savedCompanies,
      );
      //setEntityCountInCurrentView(opportunities.length);
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
