import { type ReactNode } from 'react';

import { TAB_LIST_GAP } from '@/ui/layout/tab-list/constants/TabListGap';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { NodeDimension } from '@/ui/utilities/dimensions/components/NodeDimension';
import styled from '@emotion/styled';
import { IconPlus } from 'twenty-ui/display';
import { TabButton } from 'twenty-ui/input';
import { TabMoreButton } from './TabMoreButton';

type TabListHiddenMeasurementsProps = {
  visibleTabs: SingleTabProps[];
  activeTabId: string | null;
  loading?: boolean;
  onTabWidthChange: (
    tabId: string,
  ) => (dimensions: { width: number; height: number }) => void;
  onMoreButtonWidthChange: (dimensions: {
    width: number;
    height: number;
  }) => void;
  onAddButtonWidthChange?: (dimensions: {
    width: number;
    height: number;
  }) => void;
  renderAddButton?: () => ReactNode;
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
  renderAddButton,
}: TabListHiddenMeasurementsProps) => {
  return (
    <StyledHiddenMeasurement>
      {visibleTabs.map((tab) => (
        <NodeDimension
          key={tab.id}
          onDimensionChange={onTabWidthChange(tab.id)}
        >
          <TabButton
            id={tab.id}
            title={tab.title}
            LeftIcon={tab.Icon}
            logo={tab.logo}
            active={tab.id === activeTabId}
            disabled={tab.disabled ?? loading}
            pill={tab.pill}
            disableTestId={true}
          />
        </NodeDimension>
      ))}

      <NodeDimension onDimensionChange={onMoreButtonWidthChange}>
        <TabMoreButton hiddenTabsCount={1} active={false} />
      </NodeDimension>

      {onAddButtonWidthChange && (
        <NodeDimension onDimensionChange={onAddButtonWidthChange}>
          {renderAddButton ? (
            renderAddButton()
          ) : (
            <TabButton
              id="tab-add-button"
              title="+"
              LeftIcon={IconPlus}
              disableTestId={true}
            />
          )}
        </NodeDimension>
      )}
    </StyledHiddenMeasurement>
  );
};
