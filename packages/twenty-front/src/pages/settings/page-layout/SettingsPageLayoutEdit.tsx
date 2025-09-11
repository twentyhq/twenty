import { useNavigateCommandMenu } from '@/command-menu/hooks/useNavigateCommandMenu';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { PageLayoutInitializationEffect } from '@/page-layout/components/PageLayoutInitializationEffect';
import { EMPTY_LAYOUT } from '@/page-layout/constants/EmptyLayout';
import {
  PAGE_LAYOUT_CONFIG,
  type PageLayoutBreakpoint,
} from '@/page-layout/constants/PageLayoutBreakpoints';
import { SETTINGS_PAGE_LAYOUT_TABS_INSTANCE_ID } from '@/page-layout/constants/SettingsPageLayoutTabsInstanceId';
import { useChangePageLayoutDragSelection } from '@/page-layout/hooks/useChangePageLayoutDragSelection';
import { useCreatePageLayoutTab } from '@/page-layout/hooks/useCreatePageLayoutTab';
import { useDeletePageLayoutWidget } from '@/page-layout/hooks/useDeletePageLayoutWidget';
import { useEndPageLayoutDragSelection } from '@/page-layout/hooks/useEndPageLayoutDragSelection';
import { usePageLayoutDraftState } from '@/page-layout/hooks/usePageLayoutDraftState';
import { usePageLayoutHandleLayoutChange } from '@/page-layout/hooks/usePageLayoutHandleLayoutChange';
import { usePageLayoutSaveHandler } from '@/page-layout/hooks/usePageLayoutSaveHandler';
import { useStartPageLayoutDragSelection } from '@/page-layout/hooks/useStartPageLayoutDragSelection';
import { WidgetType } from '@/page-layout/mocks/mockWidgets';
import { pageLayoutCurrentBreakpointState } from '@/page-layout/states/pageLayoutCurrentBreakpointState';
import { pageLayoutCurrentLayoutsState } from '@/page-layout/states/pageLayoutCurrentLayoutsState';
import { pageLayoutEditingWidgetIdState } from '@/page-layout/states/pageLayoutEditingWidgetIdState';
import { pageLayoutSelectedCellsState } from '@/page-layout/states/pageLayoutSelectedCellsState';
import { type PageLayoutWidgetWithData } from '@/page-layout/types/pageLayoutTypes';
import { calculateTotalGridRows } from '@/page-layout/utils/calculateTotalGridRows';
import { generateCellId } from '@/page-layout/utils/generateCellId';
import { WidgetPlaceholder } from '@/page-layout/widgets/components/WidgetPlaceholder';
import { WidgetRenderer } from '@/page-layout/widgets/components/WidgetRenderer';
import { type Widget } from '@/page-layout/widgets/types/Widget';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageFullWidthContainer } from '@/settings/components/SettingsPageFullWidthContainer';
import { TitleInput } from '@/ui/input/components/TitleInput';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { DragSelect } from '@/ui/utilities/drag-select/components/DragSelect';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Responsive,
  WidthProvider,
  type ResponsiveProps,
} from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useParams } from 'react-router-dom';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { IconAppWindow, IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const StyledGridContainer = styled.div`
  background: ${({ theme }) => theme.background.primary};
  box-sizing: border-box;
  flex: 1;
  min-height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  padding: ${({ theme }) => theme.spacing(2)};
  width: 100%;
  user-select: none;

  .react-grid-placeholder {
    background: ${({ theme }) => theme.adaptiveColors.blue3} !important;

    border-radius: ${({ theme }) => theme.border.radius.sm};
  }

  .react-grid-item:not(.react-draggable-dragging) {
    user-select: auto;
  }
`;

const StyledTabList = styled(TabList)`
  padding-left: ${({ theme }) => theme.spacing(2)};
`;

const StyledGridOverlay = styled.div<{
  isDragSelecting?: boolean;
  breakpoint: PageLayoutBreakpoint;
}>`
  position: absolute;
  top: ${({ theme }) => theme.spacing(2)};
  left: ${({ theme }) => theme.spacing(2)};
  right: ${({ theme }) => theme.spacing(2)};
  bottom: ${({ theme }) => theme.spacing(2)};
  display: grid;
  grid-template-columns: ${({ breakpoint }) =>
    breakpoint === 'mobile' ? '1fr' : 'repeat(12, 1fr)'};
  grid-auto-rows: 55px;
  gap: ${({ theme }) => theme.spacing(2)};
  pointer-events: ${({ isDragSelecting }) =>
    isDragSelecting ? 'auto' : 'none'};
  z-index: 0;
`;

const StyledActionButtonContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledGridCell = styled.div<{ isSelected?: boolean }>`
  background: ${({ isSelected, theme }) =>
    isSelected ? theme.adaptiveColors.blue1 : 'transparent'};
  border: 1px solid
    ${({ theme, isSelected }) =>
      isSelected ? theme.adaptiveColors.blue3 : theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
  transition: background-color 0.3s ease;

  &:hover {
    background: ${({ theme }) => theme.background.transparent.lighter};
    border-color: ${({ theme }) => theme.border.color.medium};
  }
`;

type ExtendedResponsiveProps = ResponsiveProps & {
  maxCols?: number;
  preventCollision?: boolean;
};

const ResponsiveGridLayout = WidthProvider(
  Responsive,
) as React.ComponentType<ExtendedResponsiveProps>;

export const SettingsPageLayoutEdit = () => {
  const { t } = useLingui();
  const { id } = useParams<{ id: string }>();
  const isEditMode = id && id !== 'new';

  const { pageLayoutDraft, setPageLayoutDraft, isDirty } =
    usePageLayoutDraftState();

  const { savePageLayout } = usePageLayoutSaveHandler();
  const navigateSettings = useNavigateSettings();
  const [isSaving, setIsSaving] = useState(false);

  const [pageLayoutCurrentBreakpoint, setPageLayoutCurrentBreakpoint] =
    useRecoilState(pageLayoutCurrentBreakpointState);
  const pageLayoutSelectedCells = useRecoilValue(pageLayoutSelectedCellsState);
  const pageLayoutCurrentLayouts = useRecoilValue(
    pageLayoutCurrentLayoutsState,
  );
  const { navigateCommandMenu } = useNavigateCommandMenu();
  const setPageLayoutEditingWidgetId = useSetRecoilState(
    pageLayoutEditingWidgetIdState,
  );

  const gridContainerRef = useRef<HTMLDivElement>(null);

  const activeTabId = useRecoilComponentValue(
    activeTabIdComponentState,
    SETTINGS_PAGE_LAYOUT_TABS_INSTANCE_ID,
  );

  const setActiveTabId = useSetRecoilState(
    activeTabIdComponentState.atomFamily({
      instanceId: SETTINGS_PAGE_LAYOUT_TABS_INSTANCE_ID,
    }),
  );

  const activeTabWidgets = useMemo(() => {
    if (!activeTabId) return [];
    const activeTab = pageLayoutDraft.tabs.find(
      (tab) => tab.id === activeTabId,
    );
    return activeTab?.widgets ?? [];
  }, [pageLayoutDraft.tabs, activeTabId]);

  const allWidgets = useMemo(
    () => pageLayoutDraft.tabs.flatMap((tab) => tab.widgets).filter(isDefined),
    [pageLayoutDraft.tabs],
  );

  const { startPageLayoutDragSelection } = useStartPageLayoutDragSelection();
  const { changePageLayoutDragSelection } = useChangePageLayoutDragSelection();
  const { endPageLayoutDragSelection } = useEndPageLayoutDragSelection();

  const handleOpenAddWidget = useCallback(() => {
    navigateCommandMenu({
      page: CommandMenuPages.PageLayoutWidgetTypeSelect,
      pageTitle: 'Add Widget',
      pageIcon: IconAppWindow,
      resetNavigationStack: true,
    });
  }, [navigateCommandMenu]);

  const { deletePageLayoutWidget } = useDeletePageLayoutWidget();
  const { handleLayoutChange } = usePageLayoutHandleLayoutChange(activeTabId);
  const { createPageLayoutTab } = useCreatePageLayoutTab();

  const handleEditWidget = useCallback(
    (widgetId: string) => {
      const widget = allWidgets.find((w) => w.id === widgetId);
      if (!widget) return;

      setPageLayoutEditingWidgetId(widgetId);

      if (widget.type === WidgetType.IFRAME) {
        navigateCommandMenu({
          page: CommandMenuPages.PageLayoutIframeConfig,
          pageTitle: 'Edit iFrame',
          pageIcon: IconAppWindow,
          resetNavigationStack: true,
        });
      }
    },
    [allWidgets, setPageLayoutEditingWidgetId, navigateCommandMenu],
  );

  const isEmptyState = activeTabWidgets.length === 0;

  const gridRows = useMemo(() => {
    const currentTabLayouts = pageLayoutCurrentLayouts[activeTabId || ''] || {
      desktop: [],
      mobile: [],
    };
    return calculateTotalGridRows(currentTabLayouts);
  }, [pageLayoutCurrentLayouts, activeTabId]);

  const handleCancel = () => {
    navigateSettings(SettingsPath.PageLayout);
  };

  const handleAddTab = useCallback(() => {
    const newTabId = createPageLayoutTab();
    setActiveTabId(newTabId);
  }, [createPageLayoutTab, setActiveTabId]);

  const tabListTabs: SingleTabProps[] = useMemo(() => {
    return [...(pageLayoutDraft.tabs ?? [])]
      .sort((a, b) => a.position - b.position)
      .map((tab) => ({
        id: tab.id,
        title: tab.title,
      }));
  }, [pageLayoutDraft.tabs]);

  const handleSaveClick = async () => {
    setIsSaving(true);
    try {
      const allWidgets: PageLayoutWidgetWithData[] =
        pageLayoutDraft.tabs.flatMap((tab) =>
          tab.widgets.map((widget) => ({
            ...widget,
            pageLayoutTabId: widget.pageLayoutTabId ?? tab.id,
            objectMetadataId: widget.objectMetadataId || null,
            createdAt: widget.createdAt ?? new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: widget.deletedAt ?? null,
          })),
        );

      setPageLayoutDraft((prev) => ({
        ...prev,
        tabs: pageLayoutDraft.tabs,
      }));

      await savePageLayout(allWidgets);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <PageLayoutInitializationEffect layoutId={id} isEditMode={!!isEditMode} />
      <SettingsPageFullWidthContainer
        links={[
          {
            children: t`Settings`,
            href: getSettingsPath(SettingsPath.Workspace),
          },
          {
            children: t`Page Layouts`,
            href: getSettingsPath(SettingsPath.PageLayout),
          },
          {
            children: (
              <TitleInput
                instanceId="page-layout-name-input"
                placeholder={t`Layout Name`}
                value={pageLayoutDraft.name}
                onChange={(value) =>
                  setPageLayoutDraft((prev) => ({ ...prev, name: value }))
                }
                sizeVariant="md"
              />
            ),
          },
        ]}
        actionButton={
          <StyledActionButtonContainer>
            <SaveAndCancelButtons
              onSave={handleSaveClick}
              onCancel={handleCancel}
              isLoading={isSaving}
              isSaveDisabled={
                !isDirty ||
                !pageLayoutDraft.name.trim() ||
                allWidgets.length === 0
              }
            />
            {!isEmptyState && (
              <Button
                Icon={IconPlus}
                title={t`Add Widget`}
                size="small"
                variant="secondary"
                onClick={handleOpenAddWidget}
              />
            )}
          </StyledActionButtonContainer>
        }
      >
        {pageLayoutDraft.tabs.length > 0 && (
          <StyledTabList
            tabs={tabListTabs}
            behaveAsLinks={false}
            componentInstanceId={SETTINGS_PAGE_LAYOUT_TABS_INSTANCE_ID}
            onAddTab={handleAddTab}
          />
        )}
        <StyledGridContainer ref={gridContainerRef}>
          <StyledGridOverlay
            isDragSelecting={pageLayoutCurrentBreakpoint !== 'mobile'}
            breakpoint={pageLayoutCurrentBreakpoint}
          >
            {Array.from({
              length:
                (pageLayoutCurrentBreakpoint === 'mobile' ? 1 : 12) * gridRows,
            }).map((_, i) => {
              const cols = pageLayoutCurrentBreakpoint === 'mobile' ? 1 : 12;
              const col = i % cols;
              const row = Math.floor(i / cols);
              const cellId = generateCellId(col, row);
              return (
                <StyledGridCell
                  key={i}
                  data-selectable-id={cellId}
                  isSelected={pageLayoutSelectedCells.has(cellId)}
                />
              );
            })}
          </StyledGridOverlay>
          <ResponsiveGridLayout
            className="layout"
            layouts={
              isEmptyState || !activeTabId
                ? EMPTY_LAYOUT
                : (pageLayoutCurrentLayouts[activeTabId] ?? EMPTY_LAYOUT)
            }
            breakpoints={PAGE_LAYOUT_CONFIG.breakpoints}
            cols={PAGE_LAYOUT_CONFIG.columns}
            rowHeight={55}
            maxCols={12}
            containerPadding={[0, 0]}
            margin={[8, 8]}
            isDraggable={pageLayoutCurrentBreakpoint !== 'mobile'}
            isResizable={pageLayoutCurrentBreakpoint !== 'mobile'}
            draggableHandle=".drag-handle"
            compactType="vertical"
            preventCollision={false}
            onLayoutChange={handleLayoutChange}
            onBreakpointChange={(newBreakpoint) =>
              setPageLayoutCurrentBreakpoint(
                newBreakpoint as PageLayoutBreakpoint,
              )
            }
          >
            {isEmptyState ? (
              <div key="empty-placeholder" data-select-disable="true">
                <WidgetPlaceholder onClick={handleOpenAddWidget} />
              </div>
            ) : (
              activeTabWidgets.map((widget) => (
                <div key={widget.id} data-select-disable="true">
                  <WidgetRenderer
                    widget={widget as Widget}
                    displayDragHandle={true}
                    onRemove={() => deletePageLayoutWidget(widget.id)}
                    onEdit={() => handleEditWidget(widget.id)}
                  />
                </div>
              ))
            )}
          </ResponsiveGridLayout>
          {pageLayoutCurrentBreakpoint !== 'mobile' && (
            <DragSelect
              selectableItemsContainerRef={gridContainerRef}
              onDragSelectionStart={startPageLayoutDragSelection}
              onDragSelectionChange={changePageLayoutDragSelection}
              onDragSelectionEnd={endPageLayoutDragSelection}
            />
          )}
        </StyledGridContainer>
      </SettingsPageFullWidthContainer>
    </>
  );
};
