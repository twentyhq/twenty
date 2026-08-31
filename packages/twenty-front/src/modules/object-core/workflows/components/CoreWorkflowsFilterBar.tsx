import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconFilter, IconStatusChange } from 'twenty-ui/icon';
import { IconButton, SearchInput } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { CORE_WORKFLOW_STATUS_FILTER_OPTIONS } from '@/object-core/workflows/constants/CoreWorkflowStatusFilterOptions';
import { useOpenCoreWorkflowFiltersSidePanel } from '@/object-core/workflows/hooks/useOpenCoreWorkflowFiltersSidePanel';
import { coreWorkflowsSearchTermState } from '@/object-core/workflows/states/coreWorkflowsSearchTermState';
import { coreWorkflowsStatusesFilterState } from '@/object-core/workflows/states/coreWorkflowsStatusesFilterState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';
import { type CoreWorkflowStatus } from '~/generated/graphql';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledSearchInputContainer = styled.div`
  width: 200px;
`;

export const CoreWorkflowsFilterBar = () => {
  const { t } = useLingui();
  const { openCoreWorkflowFiltersSidePanel } =
    useOpenCoreWorkflowFiltersSidePanel();

  const [coreWorkflowsSearchTerm, setCoreWorkflowsSearchTerm] = useAtomState(
    coreWorkflowsSearchTermState,
  );
  const [coreWorkflowsStatusesFilter, setCoreWorkflowsStatusesFilter] =
    useAtomState(coreWorkflowsStatusesFilterState);

  const removeStatus = (status: CoreWorkflowStatus) => {
    setCoreWorkflowsStatusesFilter((previousStatuses) =>
      previousStatuses.filter((previousStatus) => previousStatus !== status),
    );
  };

  const selectedStatusOptions = CORE_WORKFLOW_STATUS_FILTER_OPTIONS.filter(
    (option) => coreWorkflowsStatusesFilter.includes(option.value),
  );

  return (
    <StyledContainer>
      {selectedStatusOptions.map((option) => (
        <SortOrFilterChip
          key={option.value}
          type="filter"
          labelValue={t(option.label)}
          Icon={IconStatusChange}
          testId={`core-workflow-status-${option.value}`}
          onClick={openCoreWorkflowFiltersSidePanel}
          onRemove={() => removeStatus(option.value)}
        />
      ))}
      <StyledSearchInputContainer>
        <SearchInput
          value={coreWorkflowsSearchTerm}
          onChange={setCoreWorkflowsSearchTerm}
          placeholder={t`Search a workflow...`}
        />
      </StyledSearchInputContainer>
      <IconButton
        Icon={IconFilter}
        variant="secondary"
        size="medium"
        ariaLabel={t`Filter`}
        onClick={openCoreWorkflowFiltersSidePanel}
      />
    </StyledContainer>
  );
};
