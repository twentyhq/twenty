import { RecordIndexTabChip } from '@/object-record/record-index-tab/components/RecordIndexTabChip';
import { RecordIndexTabCount } from '@/object-record/record-index-tab/components/RecordIndexTabCount';
import { type RecordIndexTabItem } from '@/object-record/record-index-tab/types/RecordIndexTabItem';
import { TabMoreButton } from '@/ui/layout/tab-list/components/TabMoreButton';
import { TAB_LIST_GAP } from '@/ui/layout/tab-list/constants/TabListGap';
import { type TabListDimensions } from '@/ui/layout/tab-list/types/TabListDimension';
import { NodeDimension } from '@/ui/utilities/dimensions/components/NodeDimension';
import { styled } from '@linaria/react';
import { TabButton } from 'twenty-ui/components/navigation';

const StyledHiddenMeasurement = styled.div`
  display: flex;
  gap: ${TAB_LIST_GAP}px;
  pointer-events: none;
  position: absolute;
  top: -9999px;
  visibility: hidden;
`;

type RecordIndexTabsHiddenMeasurementsProps = {
  recordIndexTabItems: RecordIndexTabItem[];
  onTabWidthChange: (tabId: string) => (dimensions: TabListDimensions) => void;
  onMoreButtonWidthChange: (dimensions: TabListDimensions) => void;
};

export const RecordIndexTabsHiddenMeasurements = ({
  recordIndexTabItems,
  onTabWidthChange,
  onMoreButtonWidthChange,
}: RecordIndexTabsHiddenMeasurementsProps) => (
  <StyledHiddenMeasurement aria-hidden inert>
    {recordIndexTabItems.map((recordIndexTabItem) => (
      <NodeDimension
        key={recordIndexTabItem.id}
        onDimensionChange={onTabWidthChange(recordIndexTabItem.id)}
      >
        <TabButton
          badge={<RecordIndexTabCount recordIndexTabItem={recordIndexTabItem} />}
        >
          <RecordIndexTabChip recordIndexTabItem={recordIndexTabItem} />
        </TabButton>
      </NodeDimension>
    ))}
    <NodeDimension onDimensionChange={onMoreButtonWidthChange}>
      <TabMoreButton
        hiddenTabsCount={recordIndexTabItems.length}
        active={false}
        disableTestId
      />
    </NodeDimension>
  </StyledHiddenMeasurement>
);
