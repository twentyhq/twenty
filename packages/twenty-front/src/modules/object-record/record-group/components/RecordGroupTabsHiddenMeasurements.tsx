import { RecordGroupTabChip } from '@/object-record/record-group/components/RecordGroupTabChip';
import { RecordGroupTabCount } from '@/object-record/record-group/components/RecordGroupTabCount';
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

type RecordGroupTabsHiddenMeasurementsProps = {
  recordGroupTabIds: string[];
  onTabWidthChange: (tabId: string) => (dimensions: TabListDimensions) => void;
  onMoreButtonWidthChange: (dimensions: TabListDimensions) => void;
};

export const RecordGroupTabsHiddenMeasurements = ({
  recordGroupTabIds,
  onTabWidthChange,
  onMoreButtonWidthChange,
}: RecordGroupTabsHiddenMeasurementsProps) => (
  <StyledHiddenMeasurement aria-hidden inert>
    {recordGroupTabIds.map((recordGroupTabId) => (
      <NodeDimension
        key={recordGroupTabId}
        onDimensionChange={onTabWidthChange(recordGroupTabId)}
      >
        <TabButton
          badge={<RecordGroupTabCount recordGroupTabId={recordGroupTabId} />}
        >
          <RecordGroupTabChip recordGroupTabId={recordGroupTabId} />
        </TabButton>
      </NodeDimension>
    ))}
    <NodeDimension onDimensionChange={onMoreButtonWidthChange}>
      <TabMoreButton
        hiddenTabsCount={recordGroupTabIds.length}
        active={false}
        disableTestId
      />
    </NodeDimension>
  </StyledHiddenMeasurement>
);
