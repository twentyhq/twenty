import { CommandMenuSubPageNavigationHeader } from '@/command-menu/pages/common/components/CommandMenuSubPageNavigationHeader';
import { useNavigatePageLayoutCommandMenu } from '@/command-menu/pages/page-layout/hooks/useNavigatePageLayoutCommandMenu';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { AdvancedFilterCommandMenuContainer } from '@/object-record/advanced-filter/command-menu/components/AdvancedFilterCommandMenuContainer';
import { RecordFilterGroupsComponentInstanceContext } from '@/object-record/record-filter-group/states/context/RecordFilterGroupsComponentInstanceContext';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { InputLabel } from '@/ui/input/components/InputLabel';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { type PageLayoutWidget } from '~/generated/graphql';

const StyledChartFiltersPageContainer = styled.div`
  display: flex;
  flex-direction: column;

  gap: ${({ theme }) => theme.spacing(2)};

  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledFiltersContainer = styled.div``;

export const ChartFilters = ({
  objectMetadataItem,
  widget,
}: {
  objectMetadataItem: ObjectMetadataItem;
  widget: PageLayoutWidget;
}) => {
  const { navigatePageLayoutCommandMenu } = useNavigatePageLayoutCommandMenu();

  const handleBackClick = () => {
    navigatePageLayoutCommandMenu({
      commandMenuPage: CommandMenuPages.PageLayoutGraphTypeSelect,
    });
  };

  const instanceId = `chart-filters-widget${widget.id}-${objectMetadataItem.id}`;

  return (
    <StyledChartFiltersPageContainer>
      <CommandMenuSubPageNavigationHeader
        title={t`Filter`}
        onBackClick={handleBackClick}
      />
      <StyledFiltersContainer>
        <InputLabel>{t`Conditions`}</InputLabel>
        <RecordFilterGroupsComponentInstanceContext.Provider
          value={{ instanceId }}
        >
          <RecordFiltersComponentInstanceContext.Provider
            value={{ instanceId }}
          >
            <AdvancedFilterCommandMenuContainer
              onUpdate={() => {}}
              objectMetadataItem={objectMetadataItem}
              isWorkflowFindRecords={false}
            />
            {/* TODO: create chart record filter effect to persist filters
            <WorkflowFindRecordsFiltersEffect defaultValue={formData.filter} /> */}
          </RecordFiltersComponentInstanceContext.Provider>
        </RecordFilterGroupsComponentInstanceContext.Provider>
      </StyledFiltersContainer>
    </StyledChartFiltersPageContainer>
  );
};
