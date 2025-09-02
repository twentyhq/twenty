import { useNavigateCommandMenu } from '@/command-menu/hooks/useNavigateCommandMenu';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageFullWidthContainer } from '@/settings/components/SettingsPageFullWidthContainer';
import { PageLayoutInitializationEffect } from '@/settings/page-layout/components/PageLayoutInitializationEffect';
import { PageLayoutWidgetPlaceholder } from '@/settings/page-layout/components/PageLayoutWidgetPlaceholder';
import { EMPTY_LAYOUT } from '@/settings/page-layout/constants/EmptyLayout';
import {
  PAGE_LAYOUT_CONFIG,
  type PageLayoutBreakpoint,
} from '@/settings/page-layout/constants/PageLayoutBreakpoints';
import { usePageLayoutDraftState } from '@/settings/page-layout/hooks/usePageLayoutDraftState';
import { usePageLayoutDragSelection } from '@/settings/page-layout/hooks/usePageLayoutDragSelection';
import { usePageLayoutHandleLayoutChange } from '@/settings/page-layout/hooks/usePageLayoutHandleLayoutChange';
import { usePageLayoutSaveHandler } from '@/settings/page-layout/hooks/usePageLayoutSaveHandler';
import { usePageLayoutWidgetDelete } from '@/settings/page-layout/hooks/usePageLayoutWidgetDelete';
import { WidgetType } from '@/settings/page-layout/mocks/mockWidgets';
import { pageLayoutCurrentBreakpointState } from '@/settings/page-layout/states/pageLayoutCurrentBreakpointState';
import { pageLayoutCurrentLayoutsState } from '@/settings/page-layout/states/pageLayoutCurrentLayoutsState';
import { pageLayoutEditingWidgetIdState } from '@/settings/page-layout/states/pageLayoutEditingWidgetIdState';
import { pageLayoutSelectedCellsState } from '@/settings/page-layout/states/pageLayoutSelectedCellsState';
import { pageLayoutWidgetsState } from '@/settings/page-layout/states/pageLayoutWidgetsState';
import { calculateTotalGridRows } from '@/settings/page-layout/utils/calculateTotalGridRows';
import { convertLayoutsToWidgets } from '@/settings/page-layout/utils/convertLayoutsToWidgets';
import { generateCellId } from '@/settings/page-layout/utils/generateCellId';
import { renderWidget } from '@/settings/page-layout/utils/widgetRegistry';
import { SettingsPath } from '@/types/SettingsPath';
import { TitleInput } from '@/ui/input/components/TitleInput';
import { DragSelect } from '@/ui/utilities/drag-select/components/DragSelect';
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
import { IconAppWindow, IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const StyledGridContainer = styled.div`
  background: ${({ theme }) => theme.background.secondary};
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
  const pageLayoutWidgets = useRecoilValue(pageLayoutWidgetsState);
  const { navigateCommandMenu } = useNavigateCommandMenu();
  const setPageLayoutEditingWidgetId = useSetRecoilState(
    pageLayoutEditingWidgetIdState,
  );

  const {
    handleDragSelectionStart,
    handleDragSelectionChange,
    handleDragSelectionEnd,
  } = usePageLayoutDragSelection();

  const handleOpenAddWidget = useCallback(() => {
    navigateCommandMenu({
      page: CommandMenuPages.PageLayoutWidgetTypeSelect,
      pageTitle: 'Add Widget',
      pageIcon: IconAppWindow,
      resetNavigationStack: true,
    });
  }, [navigateCommandMenu]);

  const { handleRemoveWidget } = usePageLayoutWidgetDelete();
  const { handleLayoutChange } = usePageLayoutHandleLayoutChange();

  const handleEditWidget = useCallback(
    (widgetId: string) => {
      const widget = pageLayoutWidgets.find((w) => w.id === widgetId);
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
    [pageLayoutWidgets, setPageLayoutEditingWidgetId, navigateCommandMenu],
  );

  const gridContainerRef = useRef<HTMLDivElement>(null);

  const isEmptyState = pageLayoutWidgets.length === 0;

  const gridRows = useMemo(
    () => calculateTotalGridRows(pageLayoutCurrentLayouts),
    [pageLayoutCurrentLayouts],
  );

  const handleCancel = () => {
    navigateSettings(SettingsPath.PageLayout);
  };

  const handleSaveClick = async () => {
    setIsSaving(true);
    try {
      const widgetsWithPositions = convertLayoutsToWidgets(
        pageLayoutWidgets,
        pageLayoutCurrentLayouts,
      );

      setPageLayoutDraft((prev) => ({
        ...prev,
        widgets: widgetsWithPositions,
      }));

      await savePageLayout(widgetsWithPositions);
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
            href: '/settings/page-layout',
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
                pageLayoutWidgets.length === 0
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
            layouts={isEmptyState ? EMPTY_LAYOUT : pageLayoutCurrentLayouts}
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
              <div key="empty-placeholder" onClick={handleOpenAddWidget}>
                <PageLayoutWidgetPlaceholder title="" isEmpty />
              </div>
            ) : (
              pageLayoutWidgets.map((widget) => (
                <div key={widget.id} data-select-disable="true">
                  <PageLayoutWidgetPlaceholder
                    title={widget.title}
                    onRemove={() => handleRemoveWidget(widget.id)}
                    onEdit={() => handleEditWidget(widget.id)}
                  >
                    {renderWidget(widget)}
                  </PageLayoutWidgetPlaceholder>
                </div>
              ))
            )}
          </ResponsiveGridLayout>
          {pageLayoutCurrentBreakpoint !== 'mobile' && (
            <DragSelect
              selectableItemsContainerRef={gridContainerRef}
              onDragSelectionStart={handleDragSelectionStart}
              onDragSelectionChange={handleDragSelectionChange}
              onDragSelectionEnd={handleDragSelectionEnd}
            />
          )}
        </StyledGridContainer>
      </SettingsPageFullWidthContainer>
    </>
  );
};
