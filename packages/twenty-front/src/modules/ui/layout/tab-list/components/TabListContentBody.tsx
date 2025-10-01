import { TAB_LIST_GAP } from '@/ui/layout/tab-list/constants/TabListGap';
import { NodeDimension } from '@/ui/utilities/dimensions/components/NodeDimension';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';

import { TabListDropdown } from '@/ui/layout/tab-list/components/TabListDropdown';
import { TabListVisibleTabsArea } from '@/ui/layout/tab-list/components/TabListVisibleTabsArea';
import { useTabListContextOrThrow } from '@/ui/layout/tab-list/contexts/TabListContext';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  height: ${({ theme }) => theme.spacing(10)};
  position: relative;
  user-select: none;
  width: 100%;

  &::after {
    background-color: ${({ theme }) => theme.border.color.light};
    bottom: 0;
    content: '';
    height: 1px;
    left: 0;
    position: absolute;
    right: 0;
  }
`;

const StyledAddButton = styled.div`
  display: flex;
  align-items: center;
  height: ${({ theme }) => theme.spacing(10)};
  margin-left: ${TAB_LIST_GAP}px;
`;

export const TabListContentBody = () => {
  const { className, onContainerWidthChange, hasOverflowingTabs, onAddTab } =
    useTabListContextOrThrow();

  return (
    <NodeDimension onDimensionChange={onContainerWidthChange}>
      <StyledContainer className={className}>
        <TabListVisibleTabsArea />

        {hasOverflowingTabs && <TabListDropdown />}

        {isDefined(onAddTab) && (
          <StyledAddButton>
            <IconButton
              Icon={IconPlus}
              size="small"
              variant="tertiary"
              onClick={() => onAddTab()}
            />
          </StyledAddButton>
        )}
      </StyledContainer>
    </NodeDimension>
  );
};
