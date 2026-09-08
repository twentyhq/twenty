import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconFilter } from 'twenty-ui/icon';
import { IconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { findCoreWorkflowFilterField } from '@/object-core/workflows/utils/findCoreWorkflowFilterField';
import { useOpenCoreWorkflowFiltersSidePanel } from '@/object-core/workflows/hooks/useOpenCoreWorkflowFiltersSidePanel';
import { coreWorkflowsFilterSettingsState } from '@/object-core/workflows/states/coreWorkflowsFilterSettingsState';
import { getCoreWorkflowFilterChipLabel } from '@/object-core/workflows/utils/getCoreWorkflowFilterChipLabel';
import { isUsableCoreWorkflowFilterRule } from '@/object-core/workflows/utils/isUsableCoreWorkflowFilterRule';
import { MAX_CORE_WORKFLOW_FILTER_RULES } from 'twenty-shared/constants';
import { removeCoreWorkflowFilterRule } from '@/object-core/workflows/utils/removeCoreWorkflowFilterRule';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

export const CoreWorkflowsFilterBar = () => {
  const { t } = useLingui();
  const { openCoreWorkflowFiltersSidePanel } =
    useOpenCoreWorkflowFiltersSidePanel();

  const [coreWorkflowsFilterSettings, setCoreWorkflowsFilterSettings] =
    useAtomState(coreWorkflowsFilterSettingsState);
  const { userTimezone } = useUserTimezone();

  const appliedStepFilters = (coreWorkflowsFilterSettings.stepFilters ?? [])
    .filter(isUsableCoreWorkflowFilterRule)
    .slice(0, MAX_CORE_WORKFLOW_FILTER_RULES);

  return (
    <StyledContainer>
      {appliedStepFilters.map((stepFilter) => (
        <SortOrFilterChip
          key={stepFilter.id}
          type="filter"
          labelValue={getCoreWorkflowFilterChipLabel({
            stepFilter,
            timezone: userTimezone,
          })}
          Icon={findCoreWorkflowFilterField(stepFilter.stepOutputKey)?.Icon}
          testId={`core-workflow-filter-${stepFilter.id}`}
          onClick={openCoreWorkflowFiltersSidePanel}
          onRemove={() =>
            setCoreWorkflowsFilterSettings((previousFilterSettings) =>
              removeCoreWorkflowFilterRule({
                filterSettings: previousFilterSettings,
                stepFilterId: stepFilter.id,
              }),
            )
          }
        />
      ))}
      <IconButton
        Icon={IconFilter}
        variant="secondary"
        size="small"
        ariaLabel={t`Filter`}
        onClick={openCoreWorkflowFiltersSidePanel}
      />
    </StyledContainer>
  );
};
