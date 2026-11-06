import { RecordGroupTab } from '@/object-record/record-group/components/RecordGroupTab';
import { useActiveRecordGroupTabId } from '@/object-record/record-group/hooks/useActiveRecordGroupTabId';
import { useIsRecordGroupTabsDisplayed } from '@/object-record/record-group/hooks/useIsRecordGroupTabsDisplayed';
import { RecordGroupTabsPortalContext } from '@/object-record/record-group/states/context/RecordGroupTabsPortalContext';
import { selectedRecordGroupTabIdComponentState } from '@/object-record/record-group/states/selectedRecordGroupTabIdComponentState';
import { visibleRecordGroupIdsComponentFamilySelector } from '@/object-record/record-group/states/selectors/visibleRecordGroupIdsComponentFamilySelector';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { type ViewType } from '@/views/types/ViewType';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { createPortal } from 'react-dom';
import { isDefined } from 'twenty-shared/utils';
import { Tabs } from 'twenty-ui/primitives/navigation';

const StyledTabsScrollContainer = styled.div`
  flex-shrink: 0;
  overflow-x: auto;
`;

const StyledTabsList = styled.div`
  min-width: max-content;
`;

type RecordGroupTabsProps = {
  viewType: ViewType;
  dndType: string;
};

// Mounted inside the rows' drag-and-drop provider so tabs can be drop targets,
// and portaled above the rows' scroll container
export const RecordGroupTabs = ({
  viewType,
  dndType,
}: RecordGroupTabsProps) => {
  const { t } = useLingui();

  const recordGroupTabsPortalElement = useContext(RecordGroupTabsPortalContext);

  const isRecordGroupTabsDisplayed = useIsRecordGroupTabsDisplayed();

  const visibleRecordGroupIds = useAtomComponentFamilySelectorValue(
    visibleRecordGroupIdsComponentFamilySelector,
    viewType,
  );

  const activeRecordGroupTabId = useActiveRecordGroupTabId(viewType);

  const setSelectedRecordGroupTabId = useSetAtomComponentState(
    selectedRecordGroupTabIdComponentState,
  );

  if (!isRecordGroupTabsDisplayed || !isDefined(recordGroupTabsPortalElement)) {
    return null;
  }

  return createPortal(
    <Tabs.Root
      value={activeRecordGroupTabId}
      onValueChange={(recordGroupId: string) =>
        setSelectedRecordGroupTabId(recordGroupId)
      }
    >
      <StyledTabsScrollContainer>
        <Tabs.List aria-label={t`Groups`} render={<StyledTabsList />}>
          {visibleRecordGroupIds.map((recordGroupId) => (
            <RecordGroupTab
              key={recordGroupId}
              recordGroupId={recordGroupId}
              dndType={dndType}
            />
          ))}
          <Tabs.Indicator />
        </Tabs.List>
      </StyledTabsScrollContainer>
    </Tabs.Root>,
    recordGroupTabsPortalElement,
  );
};
