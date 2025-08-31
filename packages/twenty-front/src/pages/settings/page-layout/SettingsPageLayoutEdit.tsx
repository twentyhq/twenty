import { SaveButton } from '@/settings/components/SaveAndCancelButtons/SaveButton';
import { SettingsPageFullWidthContainer } from '@/settings/components/SettingsPageFullWidthContainer';
import { PageLayoutSidePanel } from '@/settings/page-layout/components/PageLayoutSidePanel';
import { PageLayoutWidgetPlaceholder } from '@/settings/page-layout/components/PageLayoutWidgetPlaceholder';
import {
  PAGE_LAYOUT_CONFIG,
  type PageLayoutBreakpoint,
} from '@/settings/page-layout/constants/PageLayoutBreakpoints';
import { usePageLayoutFormState } from '@/settings/page-layout/hooks/usePageLayoutFormState';
import { usePageLayoutSaveHandler } from '@/settings/page-layout/hooks/usePageLayoutSaveHandler';
import {
  type GraphSubType,
  type Widget,
} from '@/settings/page-layout/mocks/mockWidgets';
import { calculateGridBoundsFromSelectedCells } from '@/settings/page-layout/utils/calculateGridBoundsFromSelectedCells';
import { calculateTotalGridRows } from '@/settings/page-layout/utils/calculateTotalGridRows';
import { generateCellId } from '@/settings/page-layout/utils/generateCellId';
import {
  getDefaultWidgetData,
  getWidgetSize,
  getWidgetTitle,
} from '@/settings/page-layout/utils/getDefaultWidgetData';
import { getDefaultWidgetPosition } from '@/settings/page-layout/utils/getDefaultWidgetPosition';
import { renderWidget } from '@/settings/page-layout/utils/widgetRegistry';
import { SettingsPath } from '@/types/SettingsPath';
import { TitleInput } from '@/ui/input/components/TitleInput';
import { DragSelect } from '@/ui/utilities/drag-select/components/DragSelect';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useMemo, useRef, useState } from 'react';
import {
  Responsive,
  WidthProvider,
  type Layout,
  type Layouts,
  type ResponsiveProps,
} from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import { FormProvider } from 'react-hook-form';
import 'react-resizable/css/styles.css';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { v4 as uuidv4 } from 'uuid';
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
  gap: 8px;
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
  const { formMethods, canSave, existingLayout, watchedValues } =
    usePageLayoutFormState();

  const { handleSave: saveToStorage } = usePageLayoutSaveHandler();
  const { setValue, handleSubmit } = formMethods;

  // Local state for UI interactions
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [currentBreakpoint, setCurrentBreakpoint] =
    useState<PageLayoutBreakpoint>('desktop');
  const [draggedArea, setDraggedArea] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);

  const [pageLayoutWidgets, setPageLayoutWidgets] = useState<Widget[]>(() => {
    if (isDefined(existingLayout)) {
      return existingLayout.widgets.map((w) => ({
        id: w.id,
        title: w.title,
        type: w.type,
        graphType: w.graphType,
        data: w.data,
      }));
    }
    return [];
  });

  const [currentLayouts, setCurrentLayouts] = useState<Layouts>(() => {
    if (isDefined(existingLayout)) {
      const layouts = existingLayout.widgets.map((w) => ({
        i: w.id,
        x: w.gridPosition.column,
        y: w.gridPosition.row,
        w: w.gridPosition.columnSpan,
        h: w.gridPosition.rowSpan,
      }));
      return {
        desktop: layouts,
        mobile: layouts.map((l) => ({ ...l, w: 1, x: 0 })),
      };
    }
    return { desktop: [], mobile: [] };
  });

  const handleLayoutChange = (_: Layout[], allLayouts: Layouts) => {
    setCurrentLayouts(allLayouts);
  };

  const handleOpenSidePanel = () => {
    setIsSidePanelOpen(true);
  };

  const handleCloseSidePanel = () => {
    setIsSidePanelOpen(false);
    setDraggedArea(null);
  };

  const handleCreateWidget = (widgetType: 'GRAPH', graphType: GraphSubType) => {
    const widgetData = getDefaultWidgetData(graphType);

    const existingWidgetCount = pageLayoutWidgets.filter(
      (w) => w.type === widgetType && w.graphType === graphType,
    ).length;
    const title = getWidgetTitle(graphType, existingWidgetCount);

    const newWidget: Widget = {
      id: `widget-${uuidv4()}`,
      type: widgetType,
      graphType,
      title,
      data: widgetData,
    };

    const defaultSize = getWidgetSize(graphType);
    const position = getDefaultWidgetPosition(draggedArea, defaultSize);

    const newLayout = {
      i: newWidget.id,
      x: position.x,
      y: position.y,
      w: position.w,
      h: position.h,
    };

    const updatedWidgets = [...pageLayoutWidgets, newWidget];
    setPageLayoutWidgets(updatedWidgets);

    const updatedLayouts = {
      desktop: [...(currentLayouts.desktop || []), newLayout],
      mobile: [...(currentLayouts.mobile || []), { ...newLayout, w: 1, x: 0 }],
    };
    setCurrentLayouts(updatedLayouts);

    setDraggedArea(null);
  };

  const handleRemoveWidget = (widgetId: string) => {
    const updatedWidgets = pageLayoutWidgets.filter((w) => w.id !== widgetId);
    setPageLayoutWidgets(updatedWidgets);

    const updatedLayouts = {
      desktop: (currentLayouts.desktop || []).filter(
        (layout) => layout.i !== widgetId,
      ),
      mobile: (currentLayouts.mobile || []).filter(
        (layout) => layout.i !== widgetId,
      ),
    };
    setCurrentLayouts(updatedLayouts);
  };

  const handleDragSelectionStart = () => {
    setSelectedCells(new Set());
  };

  const handleDragSelectionChange = (cellId: string, selected: boolean) => {
    setSelectedCells((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(cellId);
      } else {
        newSet.delete(cellId);
      }
      return newSet;
    });
  };

  const handleDragSelectionEnd = () => {
    if (selectedCells.size > 0) {
      const draggedBounds = calculateGridBoundsFromSelectedCells(
        Array.from(selectedCells),
      );

      if (draggedBounds !== null) {
        setDraggedArea(draggedBounds);
        setIsSidePanelOpen(true);
        setSelectedCells(new Set());
      }
    }
  };

  const isEmptyState = pageLayoutWidgets.length === 0;
  const layoutName = watchedValues.name;

  const emptyLayout: Layouts = {
    desktop: [{ i: 'empty-placeholder', x: 0, y: 0, w: 4, h: 4, static: true }],
    mobile: [{ i: 'empty-placeholder', x: 0, y: 0, w: 1, h: 4, static: true }],
  };

  const gridRows = useMemo(
    () => calculateTotalGridRows(currentLayouts),
    [currentLayouts],
  );

  return (
    // @charlesBochet I know your opinion on react hook form -- happy to find alternatives in upcoming prs -- can we keep this for now?
    // eslint-disable-next-line react/jsx-props-no-spreading
    <FormProvider {...formMethods}>
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
                value={layoutName}
                onChange={(value) => setValue('name', value)}
                sizeVariant="md"
              />
            ),
          },
        ]}
        actionButton={
          <StyledActionButtonContainer>
            {!isEmptyState && (
              <Button
                Icon={IconPlus}
                title={t`Add Widget`}
                size="small"
                variant="secondary"
                onClick={handleOpenSidePanel}
              />
            )}
            <SaveButton
              onSave={() => {
                const currentBreakpointLayout =
                  currentLayouts[currentBreakpoint] ||
                  currentLayouts.desktop ||
                  [];

                const widgetsWithPositions = pageLayoutWidgets.map((widget) => {
                  const layout = currentBreakpointLayout.find(
                    (l) => l.i === widget.id,
                  );
                  return {
                    ...widget,
                    gridPosition: {
                      row: layout?.y || 0,
                      column: layout?.x || 0,
                      rowSpan: layout?.h || 2,
                      columnSpan: layout?.w || 2,
                    },
                  };
                });

                setValue('widgets', widgetsWithPositions);
                handleSubmit(saveToStorage)();
              }}
              disabled={!canSave || pageLayoutWidgets.length === 0}
            />
          </StyledActionButtonContainer>
        }
      >
        <StyledGridContainer ref={gridContainerRef}>
          <StyledGridOverlay
            isDragSelecting={currentBreakpoint !== 'mobile'}
            breakpoint={currentBreakpoint}
          >
            {Array.from({
              length: (currentBreakpoint === 'mobile' ? 1 : 12) * gridRows,
            }).map((_, i) => {
              const cols = currentBreakpoint === 'mobile' ? 1 : 12;
              const col = i % cols;
              const row = Math.floor(i / cols);
              const cellId = generateCellId(col, row);
              return (
                <StyledGridCell
                  key={i}
                  data-selectable-id={cellId}
                  isSelected={selectedCells.has(cellId)}
                />
              );
            })}
          </StyledGridOverlay>
          <ResponsiveGridLayout
            className="layout"
            layouts={isEmptyState ? emptyLayout : currentLayouts}
            breakpoints={PAGE_LAYOUT_CONFIG.breakpoints}
            cols={PAGE_LAYOUT_CONFIG.columns}
            rowHeight={55}
            maxCols={12}
            containerPadding={[0, 0]}
            margin={[8, 8]}
            isDraggable={currentBreakpoint !== 'mobile'}
            isResizable={currentBreakpoint !== 'mobile'}
            draggableHandle=".drag-handle"
            compactType="vertical"
            preventCollision={false}
            onLayoutChange={handleLayoutChange}
            onBreakpointChange={(newBreakpoint) =>
              setCurrentBreakpoint(newBreakpoint as PageLayoutBreakpoint)
            }
          >
            {isEmptyState ? (
              <div key="empty-placeholder" onClick={handleOpenSidePanel}>
                <PageLayoutWidgetPlaceholder title="" isEmpty={true} />
              </div>
            ) : (
              pageLayoutWidgets.map((widget) => (
                <div key={widget.id} data-select-disable="true">
                  <PageLayoutWidgetPlaceholder
                    title={widget.title}
                    onRemove={() => handleRemoveWidget(widget.id)}
                  >
                    {renderWidget(widget)}
                  </PageLayoutWidgetPlaceholder>
                </div>
              ))
            )}
          </ResponsiveGridLayout>
          {currentBreakpoint !== 'mobile' && (
            <DragSelect
              selectableItemsContainerRef={gridContainerRef}
              onDragSelectionStart={handleDragSelectionStart}
              onDragSelectionChange={handleDragSelectionChange}
              onDragSelectionEnd={handleDragSelectionEnd}
            />
          )}
        </StyledGridContainer>
        <PageLayoutSidePanel
          isOpen={isSidePanelOpen}
          onClose={handleCloseSidePanel}
          onCreateWidget={handleCreateWidget}
        />
      </SettingsPageFullWidthContainer>
    </FormProvider>
  );
};
