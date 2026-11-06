import { RecordGroupTab } from '@/object-record/record-group/components/RecordGroupTab';
import { useActiveRecordGroupTabId } from '@/object-record/record-group/hooks/useActiveRecordGroupTabId';
import { useIsRecordGroupTabsDisplayed } from '@/object-record/record-group/hooks/useIsRecordGroupTabsDisplayed';
import { selectedRecordGroupTabIdComponentState } from '@/object-record/record-group/states/selectedRecordGroupTabIdComponentState';
import { visibleRecordGroupIdsComponentFamilySelector } from '@/object-record/record-group/states/selectors/visibleRecordGroupIdsComponentFamilySelector';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { type ViewType } from '@/views/types/ViewType';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
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
};

export const RecordGroupTabs = ({ viewType }: RecordGroupTabsProps) => {
  const { t } = useLingui();

  const isRecordGroupTabsDisplayed = useIsRecordGroupTabsDisplayed();

  const visibleRecordGroupIds = useAtomComponentFamilySelectorValue(
    visibleRecordGroupIdsComponentFamilySelector,
    viewType,
  );

  const activeRecordGroupTabId = useActiveRecordGroupTabId(viewType);

  const setSelectedRecordGroupTabId = useSetAtomComponentState(
    selectedRecordGroupTabIdComponentState,
  );

  if (!isRecordGroupTabsDisplayed) {
    return null;
  }

  return (
    <Tabs.Root
      value={activeRecordGroupTabId}
      onValueChange={(recordGroupId: string) =>
        setSelectedRecordGroupTabId(recordGroupId)
      }
    >
      <StyledTabsScrollContainer>
        <Tabs.List aria-label={t`Groups`} render={<StyledTabsList />}>
          {visibleRecordGroupIds.map((recordGroupId) => (
            <RecordGroupTab key={recordGroupId} recordGroupId={recordGroupId} />
          ))}
          <Tabs.Indicator />
        </Tabs.List>
      </StyledTabsScrollContainer>
    </Tabs.Root>
  );
};
