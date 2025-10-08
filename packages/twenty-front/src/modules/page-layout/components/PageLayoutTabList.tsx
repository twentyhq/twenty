import styled from '@emotion/styled';
import { DragDropContext, type OnDragEndResponder } from '@hello-pangea/dnd';
import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconPlus } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';

import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { TabListFromUrlOptionalEffect } from '@/ui/layout/tab-list/components/TabListFromUrlOptionalEffect';
import { TabListHiddenMeasurements } from '@/ui/layout/tab-list/components/TabListHiddenMeasurements';
import { TAB_LIST_GAP } from '@/ui/layout/tab-list/constants/TabListGap';
import { useTabListMeasurements } from '@/ui/layout/tab-list/hooks/useTabListMeasurements';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import { type TabListProps } from '@/ui/layout/tab-list/types/TabListProps';
import { NodeDimension } from '@/ui/utilities/dimensions/components/NodeDimension';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';

import { PageLayoutTabListReorderableOverflowDropdown } from '@/page-layout/components/PageLayoutTabListReorderableOverflowDropdown';
import { PageLayoutTabListStaticOverflowDropdown } from '@/page-layout/components/PageLayoutTabListStaticOverflowDropdown';
import { PageLayoutTabListVisibleTabs } from '@/page-layout/components/PageLayoutTabListVisibleTabs';
import { isDefined } from 'twenty-shared/utils';

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

type PageLayoutTabListProps = TabListProps & {
  isReorderEnabled: boolean;
  onAddTab?: () => void;
  onReorder?: OnDragEndResponder;
};

export const PageLayoutTabList = ({
  tabs,
  loading,
  behaveAsLinks = true,
  isInRightDrawer,
  className,
  componentInstanceId,
  onChangeTab,
  onAddTab,
  isReorderEnabled,
  onReorder,
}: PageLayoutTabListProps) => {
  const visibleTabs = useMemo(() => tabs.filter((tab) => !tab.hide), [tabs]);
  const navigate = useNavigate();

  const [activeTabId, setActiveTabId] = useRecoilComponentState(
    activeTabIdComponentState,
    componentInstanceId,
  );

  const activeTabExists = visibleTabs.some((tab) => tab.id === activeTabId);
  const initialActiveTabId = activeTabExists ? activeTabId : visibleTabs[0]?.id;

  const {
    visibleTabCount,
    hiddenTabs,
    hiddenTabsCount,
    hasHiddenTabs,
    onTabWidthChange,
    onContainerWidthChange,
    onMoreButtonWidthChange,
    onAddButtonWidthChange,
  } = useTabListMeasurements({
    visibleTabs,
    hasAddButton: isDefined(onAddTab),
  });

  const dropdownId = `tab-overflow-${componentInstanceId}`;
  const { closeDropdown } = useCloseDropdown();

  const isActiveTabHidden = useMemo(() => {
    if (!hasHiddenTabs) return false;
    return hiddenTabs.some((tab) => tab.id === activeTabId);
  }, [hasHiddenTabs, hiddenTabs, activeTabId]);

  useEffect(() => {
    setActiveTabId(initialActiveTabId);
    onChangeTab?.(initialActiveTabId || '');
  }, [initialActiveTabId, setActiveTabId, onChangeTab]);

  const selectTab = useCallback(
    (tabId: string) => {
      setActiveTabId(tabId);
      onChangeTab?.(tabId);
    },
    [setActiveTabId, onChangeTab],
  );

  const selectTabFromDropdown = useCallback(
    (tabId: string) => {
      if (behaveAsLinks) {
        navigate(`#${tabId}`);
        onChangeTab?.(tabId);
        return;
      }

      selectTab(tabId);
    },
    [behaveAsLinks, selectTab, navigate, onChangeTab],
  );

  const closeOverflowDropdown = useCallback(() => {
    closeDropdown(dropdownId);
  }, [closeDropdown, dropdownId]);

  const handleDragEnd = useCallback<OnDragEndResponder>(
    (result, provided) => {
      if (!onReorder) {
        return;
      }

      onReorder(result, provided);
    },
    [onReorder],
  );

  if (visibleTabs.length === 0) {
    return null;
  }

  const canReorderTabs = isReorderEnabled && isDefined(onReorder);

  const shouldRenderReorderableDropdown = hasHiddenTabs && canReorderTabs;

  const shouldRenderStaticDropdown = hasHiddenTabs && !canReorderTabs;

  return (
    <TabListComponentInstanceContext.Provider
      value={{ instanceId: componentInstanceId }}
    >
      <TabListFromUrlOptionalEffect
        isInRightDrawer={!!isInRightDrawer}
        tabListIds={tabs.map((tab) => tab.id)}
      />

      {visibleTabs.length > 1 && (
        <TabListHiddenMeasurements
          visibleTabs={visibleTabs}
          activeTabId={activeTabId}
          loading={loading}
          onTabWidthChange={onTabWidthChange}
          onMoreButtonWidthChange={onMoreButtonWidthChange}
          onAddButtonWidthChange={onAddTab ? onAddButtonWidthChange : undefined}
          addButtonMeasurement={
            onAddTab ? (
              <StyledAddButton>
                <IconButton Icon={IconPlus} size="small" variant="tertiary" />
              </StyledAddButton>
            ) : undefined
          }
        />
      )}

      <NodeDimension onDimensionChange={onContainerWidthChange}>
        {isReorderEnabled && onReorder ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <StyledContainer className={className}>
              <PageLayoutTabListVisibleTabs
                visibleTabs={visibleTabs}
                visibleTabCount={visibleTabCount}
                activeTabId={activeTabId}
                behaveAsLinks={behaveAsLinks}
                loading={loading}
                onChangeTab={onChangeTab}
                onSelectTab={selectTab}
                canReorder={canReorderTabs}
              />

              {shouldRenderReorderableDropdown && (
                <PageLayoutTabListReorderableOverflowDropdown
                  dropdownId={dropdownId}
                  hiddenTabs={hiddenTabs}
                  hiddenTabsCount={hiddenTabsCount}
                  isActiveTabHidden={isActiveTabHidden}
                  activeTabId={activeTabId || ''}
                  loading={loading}
                  onSelect={selectTabFromDropdown}
                  visibleTabCount={visibleTabCount}
                  onClose={closeOverflowDropdown}
                />
              )}

              {onAddTab && (
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
          </DragDropContext>
        ) : (
          <StyledContainer className={className}>
            <PageLayoutTabListVisibleTabs
              visibleTabs={visibleTabs}
              visibleTabCount={visibleTabCount}
              activeTabId={activeTabId}
              behaveAsLinks={behaveAsLinks}
              loading={loading}
              onChangeTab={onChangeTab}
              onSelectTab={selectTab}
              canReorder={canReorderTabs}
            />

            {shouldRenderStaticDropdown && (
              <PageLayoutTabListStaticOverflowDropdown
                dropdownId={dropdownId}
                hiddenTabs={hiddenTabs}
                hiddenTabsCount={hiddenTabsCount}
                isActiveTabHidden={isActiveTabHidden}
                activeTabId={activeTabId || ''}
                loading={loading}
                onSelect={selectTabFromDropdown}
                onClose={closeOverflowDropdown}
              />
            )}

            {onAddTab && (
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
        )}
      </NodeDimension>
    </TabListComponentInstanceContext.Provider>
  );
};
