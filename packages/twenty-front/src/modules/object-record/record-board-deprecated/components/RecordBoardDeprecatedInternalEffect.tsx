import { useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { useObjectRecordBoardDeprecated } from '@/object-record/hooks/useObjectRecordBoardDeprecated';
import { useRecordBoardDeprecatedActionBarEntriesInternal } from '@/object-record/record-board-deprecated/hooks/internal/useRecordBoardDeprecatedActionBarEntriesInternal';
import { useRecordBoardDeprecatedContextMenuEntriesInternal } from '@/object-record/record-board-deprecated/hooks/internal/useRecordBoardDeprecatedContextMenuEntriesInternal';
import { useRecordBoardDeprecatedScopedStates } from '@/object-record/record-board-deprecated/hooks/internal/useRecordBoardDeprecatedScopedStates';
import { useUpdateCompanyBoardColumnsInternal } from '@/object-record/record-board-deprecated/hooks/internal/useUpdateCompanyBoardColumnsInternal';
import { isNonNullable } from '~/utils/isNonNullable';

export type RecordBoardDeprecatedInternalEffectProps = {
  onFieldsChange: (fields: any) => void;
};

export const RecordBoardDeprecatedInternalEffect = () => {
  const updateCompanyColumnsBoardInternal =
    useUpdateCompanyBoardColumnsInternal();
  const { setActionBarEntries } =
    useRecordBoardDeprecatedActionBarEntriesInternal();
  const { setContextMenuEntries } =
    useRecordBoardDeprecatedContextMenuEntriesInternal();

  const {
    savedPipelineStepsState,
    savedOpportunitiesState,
    savedCompaniesState,
  } = useRecordBoardDeprecatedScopedStates();

  const { fetchMoreOpportunities, fetchMoreCompanies, opportunities } =
    useObjectRecordBoardDeprecated();

  const [savedOpportunities, setSavedOpportunities] = useRecoilState(
    savedOpportunitiesState,
  );
  const savedPipelineSteps = useRecoilValue(savedPipelineStepsState);
  const savedCompanies = useRecoilValue(savedCompaniesState);

  useEffect(() => {
    setSavedOpportunities(opportunities);
  }, [opportunities, setSavedOpportunities]);

  useEffect(() => {
    if (isNonNullable(fetchMoreOpportunities)) {
      fetchMoreOpportunities();
    }
  }, [fetchMoreOpportunities]);

  useEffect(() => {
    if (isNonNullable(fetchMoreCompanies)) {
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
