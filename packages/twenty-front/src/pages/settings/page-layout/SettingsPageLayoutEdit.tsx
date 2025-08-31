import { SaveButton } from '@/settings/components/SaveAndCancelButtons/SaveButton';
import { SettingsPageFullWidthContainer } from '@/settings/components/SettingsPageFullWidthContainer';
import { PageLayoutSidePanel } from '@/settings/page-layout/components/PageLayoutSidePanel';
import { PageLayoutWidgetPlaceholder } from '@/settings/page-layout/components/PageLayoutWidgetPlaceholder';
import {
  PAGE_LAYOUT_CONFIG,
  type PageLayoutBreakpoint,
} from '@/settings/page-layout/constants/PageLayoutBreakpoints';
import { usePageLayoutDragSelection } from '@/settings/page-layout/hooks/usePageLayoutDragSelection';
import { usePageLayoutFormState } from '@/settings/page-layout/hooks/usePageLayoutFormState';
import { usePageLayoutGrid } from '@/settings/page-layout/hooks/usePageLayoutGrid';
import { usePageLayoutHandleLayoutChange } from '@/settings/page-layout/hooks/usePageLayoutHandleLayoutChange';
import { usePageLayoutInitialize } from '@/settings/page-layout/hooks/usePageLayoutInitialize';
import { usePageLayoutSaveHandler } from '@/settings/page-layout/hooks/usePageLayoutSaveHandler';
import { usePageLayoutSidePanel } from '@/settings/page-layout/hooks/usePageLayoutSidePanel';
import { usePageLayoutWidgetCreate } from '@/settings/page-layout/hooks/usePageLayoutWidgetCreate';
import { usePageLayoutWidgetDelete } from '@/settings/page-layout/hooks/usePageLayoutWidgetDelete';
import { calculateTotalGridRows } from '@/settings/page-layout/utils/calculateTotalGridRows';
import { generateCellId } from '@/settings/page-layout/utils/generateCellId';
import { renderWidget } from '@/settings/page-layout/utils/widgetRegistry';
import { SettingsPath } from '@/types/SettingsPath';
import { TitleInput } from '@/ui/input/components/TitleInput';
import { DragSelect } from '@/ui/utilities/drag-select/components/DragSelect';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useMemo, useRef } from 'react';
import {
  Responsive,
  WidthProvider,
  type Layouts,
  type ResponsiveProps,
} from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import { FormProvider } from 'react-hook-form';
import 'react-resizable/css/styles.css';
import { IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
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
  const { formMethods, canSave, existingLayout, watchedValues } =
    usePageLayoutFormState();

  const { handleSave: saveToStorage } = usePageLayoutSaveHandler();
  const { setValue, handleSubmit } = formMethods;

  usePageLayoutInitialize(existingLayout);

  const {
    pageLayoutCurrentBreakpoint,
    setPageLayoutCurrentBreakpoint,
    pageLayoutSelectedCells,
    pageLayoutCurrentLayouts,
    pageLayoutWidgets,
    pageLayoutSidePanelOpen,
  } = usePageLayoutGrid();

  const {
    handleDragSelectionStart,
    handleDragSelectionChange,
    handleDragSelectionEnd,
  } = usePageLayoutDragSelection();

  const { handleOpenSidePanel, handleCloseSidePanel } =
    usePageLayoutSidePanel();

  const { handleCreateWidget } = usePageLayoutWidgetCreate();
  const { handleRemoveWidget } = usePageLayoutWidgetDelete();
  const { handleLayoutChange } = usePageLayoutHandleLayoutChange();

  const gridContainerRef = useRef<HTMLDivElement>(null);

  const isEmptyState = pageLayoutWidgets.length === 0;
  const layoutName = watchedValues.name;

  const emptyLayout: Layouts = {
    desktop: [{ i: 'empty-placeholder', x: 0, y: 0, w: 4, h: 4, static: true }],
    mobile: [{ i: 'empty-placeholder', x: 0, y: 0, w: 1, h: 4, static: true }],
  };

  const gridRows = useMemo(
    () => calculateTotalGridRows(pageLayoutCurrentLayouts),
    [pageLayoutCurrentLayouts],
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
                  pageLayoutCurrentLayouts[pageLayoutCurrentBreakpoint] ||
                  pageLayoutCurrentLayouts.desktop ||
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
            layouts={isEmptyState ? emptyLayout : pageLayoutCurrentLayouts}
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
          {pageLayoutCurrentBreakpoint !== 'mobile' && (
            <DragSelect
              selectableItemsContainerRef={gridContainerRef}
              onDragSelectionStart={handleDragSelectionStart}
              onDragSelectionChange={handleDragSelectionChange}
              onDragSelectionEnd={handleDragSelectionEnd}
            />
          )}
        </StyledGridContainer>
        <PageLayoutSidePanel
          isOpen={pageLayoutSidePanelOpen}
          onClose={handleCloseSidePanel}
          onCreateWidget={handleCreateWidget}
        />
      </SettingsPageFullWidthContainer>
    </FormProvider>
  );
};
