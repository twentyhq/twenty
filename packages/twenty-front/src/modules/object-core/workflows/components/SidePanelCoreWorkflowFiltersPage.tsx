import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { MenuItemMultiSelectTag } from 'twenty-ui/navigation';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { Label } from 'twenty-ui/typography';

import { CORE_WORKFLOW_STATUS_FILTER_OPTIONS } from '@/object-core/workflows/constants/CoreWorkflowStatusFilterOptions';
import { coreWorkflowsStatusesFilterState } from '@/object-core/workflows/states/coreWorkflowsStatusesFilterState';
import { toggleCoreWorkflowStatusFilter } from '@/object-core/workflows/utils/toggleCoreWorkflowStatusFilter';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { type CoreWorkflowStatus } from '~/generated/graphql';

const StyledPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledSectionLabelContainer = styled.div`
  padding: ${themeCssVariables.spacing[1]};
`;

export const SidePanelCoreWorkflowFiltersPage = () => {
  const { t } = useLingui();

  const [coreWorkflowsStatusesFilter, setCoreWorkflowsStatusesFilter] =
    useAtomState(coreWorkflowsStatusesFilterState);

  const toggleStatus = (status: CoreWorkflowStatus) => {
    setCoreWorkflowsStatusesFilter((previousStatuses) =>
      toggleCoreWorkflowStatusFilter(previousStatuses, status),
    );
  };

  return (
    <StyledPageContainer>
      <StyledSectionLabelContainer>
        <Label>{t`Status`}</Label>
      </StyledSectionLabelContainer>
      {CORE_WORKFLOW_STATUS_FILTER_OPTIONS.map((option) => (
        <MenuItemMultiSelectTag
          key={option.value}
          selected={coreWorkflowsStatusesFilter.includes(option.value)}
          color={option.color}
          text={t(option.label)}
          onClick={() => toggleStatus(option.value)}
        />
      ))}
    </StyledPageContainer>
  );
};
