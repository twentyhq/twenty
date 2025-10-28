import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { AdvancedFilterAddFilterRuleSelect } from '@/object-record/advanced-filter/components/AdvancedFilterAddFilterRuleSelect';
import { AdvancedFilterRecordFilterGroupRow } from '@/object-record/advanced-filter/components/AdvancedFilterRecordFilterGroupRow';
import { AdvancedFilterRecordFilterRow } from '@/object-record/advanced-filter/components/AdvancedFilterRecordFilterRow';

import { ADVANCED_FILTER_DROPDOWN_CONTENT_WIDTH } from '@/object-record/advanced-filter/constants/AdvancedFilterDropdownContentWidth';
import { useChildRecordFiltersAndRecordFilterGroups } from '@/object-record/advanced-filter/hooks/useChildRecordFiltersAndRecordFilterGroups';
import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { rootLevelRecordFilterGroupComponentSelector } from '@/object-record/advanced-filter/states/rootLevelRecordFilterGroupComponentSelector';
import { isRecordFilterGroupChildARecordFilterGroup } from '@/object-record/advanced-filter/utils/isRecordFilterGroupChildARecordFilterGroup';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';

const StyledContainer = styled.div`
  align-items: start;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
`;

export const AdvancedFilterRootRecordFilterGroup = () => {
  const rootRecordFilterGroup = useRecoilComponentValue(
    rootLevelRecordFilterGroupComponentSelector,
  );

  const { childRecordFiltersAndRecordFilterGroups } =
    useChildRecordFiltersAndRecordFilterGroups({
      recordFilterGroupId: rootRecordFilterGroup?.id,
    });

  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  if (!isDefined(rootRecordFilterGroup)) {
    return null;
  }

  return (
    <ScrollWrapper
      componentInstanceId={`scroll-wrapper-dropdown-menu-${rootRecordFilterGroup.id}`}
    >
      <DropdownContent widthInPixels={ADVANCED_FILTER_DROPDOWN_CONTENT_WIDTH}>
        <AdvancedFilterContext.Provider value={{ objectMetadataItem }}>
          <StyledContainer>
            {childRecordFiltersAndRecordFilterGroups.map(
              (recordFilterGroupChild, recordFilterGroupChildIndex) =>
                isRecordFilterGroupChildARecordFilterGroup(
                  recordFilterGroupChild,
                ) ? (
                  <AdvancedFilterRecordFilterGroupRow
                    key={recordFilterGroupChild.id}
                    parentRecordFilterGroup={rootRecordFilterGroup}
                    recordFilterGroup={recordFilterGroupChild}
                    recordFilterGroupIndex={recordFilterGroupChildIndex}
                  />
                ) : (
                  <AdvancedFilterRecordFilterRow
                    key={recordFilterGroupChild.id}
                    recordFilterGroup={rootRecordFilterGroup}
                    recordFilter={recordFilterGroupChild}
                    recordFilterIndex={recordFilterGroupChildIndex}
                  />
                ),
            )}
            <AdvancedFilterAddFilterRuleSelect
              recordFilterGroup={rootRecordFilterGroup}
            />
          </StyledContainer>
        </AdvancedFilterContext.Provider>
      </DropdownContent>
    </ScrollWrapper>
  );
};
