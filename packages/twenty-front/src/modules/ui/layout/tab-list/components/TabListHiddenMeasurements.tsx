import type { ReactNode } from 'react';

import { TAB_LIST_GAP } from '@/ui/layout/tab-list/constants/TabListGap';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { NodeDimension } from '@/ui/utilities/dimensions/components/NodeDimension';
import { styled } from '@linaria/react';
import { IconPlus } from 'twenty-ui/icon';
import { TabButton } from 'twenty-ui/components';
import { getTabListItemContent } from '@/ui/layout/tab-list/utils/getTabListItemContent';

import { type TabListDimensions } from '@/ui/layout/tab-list/types/TabListDimension';
import { TabMoreButton } from './TabMoreButton';

type TabListHiddenMeasurementsProps = {
  visibleTabs: SingleTabProps[];
  activeTabId: string | null;
  loading?: boolean;
  onTabWidthChange: (tabId: string) => (dimensions: TabListDimensions) => void;
  onMoreButtonWidthChange: (dimensions: TabListDimensions) => void;
  onAddButtonWidthChange?: (dimensions: TabListDimensions) => void;
  addButtonMeasurement?: ReactNode;
};

const StyledHiddenMeasurement = styled.div`
  display: flex;
  gap: ${TAB_LIST_GAP}px;
  pointer-events: none;
  position: absolute;
  top: -9999px;
  visibility: hidden;
`;

export const TabListHiddenMeasurements = ({
  visibleTabs,
  activeTabId,
  loading,
  onTabWidthChange,
  onMoreButtonWidthChange,
  onAddButtonWidthChange,
  addButtonMeasurement,
}: TabListHiddenMeasurementsProps) => {
  return (
    <StyledHiddenMeasurement aria-hidden inert>
      {visibleTabs.map((tab) => {
        const { startIcon, badge } = getTabListItemContent(tab);

        return (
          <NodeDimension
            key={tab.id}
            onDimensionChange={onTabWidthChange(tab.id)}
          >
            <TabButton
              children={tab.title}
              startIcon={startIcon}
              active={tab.id === activeTabId}
              disabled={tab.disabled ?? loading}
              badge={badge}
            />
          </NodeDimension>
        );
      })}

      <NodeDimension onDimensionChange={onMoreButtonWidthChange}>
        {/* Measured with the highest count it can ever display, so the widest
        label is reserved and the last visible tab is never clipped by it. */}
        <TabMoreButton
          hiddenTabsCount={visibleTabs.length}
          active={false}
          disableTestId
        />
      </NodeDimension>

      {onAddButtonWidthChange && (
        <NodeDimension onDimensionChange={onAddButtonWidthChange}>
          {addButtonMeasurement ?? (
            <TabButton children="+" startIcon={<IconPlus />} />
          )}
        </NodeDimension>
      )}
    </StyledHiddenMeasurement>
  );
};
