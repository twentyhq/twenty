import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconFilter } from 'twenty-ui/icon';
import { IconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { findCoreWorkflowFilterField } from '@/object-core/workflows/utils/findCoreWorkflowFilterField';
import { useOpenCoreWorkflowFiltersSidePanel } from '@/object-core/workflows/hooks/useOpenCoreWorkflowFiltersSidePanel';
import { coreWorkflowsFilterSettingsState } from '@/object-core/workflows/states/coreWorkflowsFilterSettingsState';
import { getCoreWorkflowFilterChipLabel } from '@/object-core/workflows/utils/getCoreWorkflowFilterChipLabel';
import { removeCoreWorkflowFilterRule } from '@/object-core/workflows/utils/removeCoreWorkflowFilterRule';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

export const CoreWorkflowsFilterBar = () => {
  const { t } = useLingui();
  const { openCoreWorkflowFiltersSidePanel } =
    useOpenCoreWorkflowFiltersSidePanel();

  const [coreWorkflowsFilterSettings, setCoreWorkflowsFilterSettings] =
    useAtomState(coreWorkflowsFilterSettingsState);

  const appliedStepFilters = (
    coreWorkflowsFilterSettings.stepFilters ?? []
  ).filter((stepFilter) =>
    isDefined(findCoreWorkflowFilterField(stepFilter.stepOutputKey)),
  );

  return (
    <StyledContainer>
      {appliedStepFilters.map((stepFilter) => (
        <SortOrFilterChip
          key={stepFilter.id}
          type="filter"
          labelValue={getCoreWorkflowFilterChipLabel(stepFilter)}
          Icon={findCoreWorkflowFilterField(stepFilter.stepOutputKey)?.Icon}
          testId={`core-workflow-filter-${stepFilter.id}`}
          onClick={openCoreWorkflowFiltersSidePanel}
          onRemove={() =>
            setCoreWorkflowsFilterSettings((previousFilterSettings) =>
              removeCoreWorkflowFilterRule(
                previousFilterSettings,
                stepFilter.id,
              ),
            )
          }
        />
      ))}
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
