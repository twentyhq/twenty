import { styled } from '@linaria/react';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Temporal } from 'temporal-polyfill';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';

import { RecordRoadmapDependencyConnectors } from '@/object-record/record-roadmap/components/RecordRoadmapDependencyConnectors';
import { RecordRoadmapNameColumn } from '@/object-record/record-roadmap/components/RecordRoadmapNameColumn';
import { RecordRoadmapRow } from '@/object-record/record-roadmap/components/RecordRoadmapRow';
import { RecordRoadmapSwimlane } from '@/object-record/record-roadmap/components/RecordRoadmapSwimlane';
import { RecordRoadmapTimeHeader } from '@/object-record/record-roadmap/components/RecordRoadmapTimeHeader';
import { RecordRoadmapTodayLine } from '@/object-record/record-roadmap/components/RecordRoadmapTodayLine';
import { RecordRoadmapWeekendsOverlay } from '@/object-record/record-roadmap/components/RecordRoadmapWeekendsOverlay';
import { ROADMAP_DAY_WIDTH_BY_ZOOM } from '@/object-record/record-roadmap/constants/RoadmapZoomLevels';
import { useRecordRoadmapContextOrThrow } from '@/object-record/record-roadmap/contexts/RecordRoadmapContext';
import {
  ROADMAP_NAME_COLUMN_FIELD_WIDTH,
  ROADMAP_NAME_COLUMN_WIDTH,
} from '@/object-record/record-roadmap/constants/RoadmapDimensions';
import { useOpenRecordFromIndexView } from '@/object-record/record-index/hooks/useOpenRecordFromIndexView';
import { useRecordRoadmapCreateOnDoubleClick } from '@/object-record/record-roadmap/hooks/useRecordRoadmapCreateOnDoubleClick';
import { useRecordRoadmapDependencies } from '@/object-record/record-roadmap/hooks/useRecordRoadmapDependencies';
import { useRecordRoadmapFetchRecords } from '@/object-record/record-roadmap/hooks/useRecordRoadmapFetchRecords';
import {
  ROADMAP_UNCATEGORIZED_SWIMLANE_KEY,
  useRecordRoadmapSwimlanes,
} from '@/object-record/record-roadmap/hooks/useRecordRoadmapSwimlanes';
import { useRecordRoadmapUpdateDates } from '@/object-record/record-roadmap/hooks/useRecordRoadmapUpdateDates';
import { useRecordRoadmapWheelZoom } from '@/object-record/record-roadmap/hooks/useRecordRoadmapWheelZoom';
import { recordIndexRoadmapFieldBlockedByIdState } from '@/object-record/record-index/states/recordIndexRoadmapFieldBlockedByIdState';
import { recordIndexRoadmapFieldColorIdState } from '@/object-record/record-index/states/recordIndexRoadmapFieldColorIdState';
import { recordIndexRoadmapFieldEndIdState } from '@/object-record/record-index/states/recordIndexRoadmapFieldEndIdState';
import { recordIndexRoadmapFieldLabelIdState } from '@/object-record/record-index/states/recordIndexRoadmapFieldLabelIdState';
import { recordIndexRoadmapFieldPlannedEndIdState } from '@/object-record/record-index/states/recordIndexRoadmapFieldPlannedEndIdState';
import { recordIndexRoadmapFieldPlannedStartIdState } from '@/object-record/record-index/states/recordIndexRoadmapFieldPlannedStartIdState';
import { recordIndexRoadmapFieldStartIdState } from '@/object-record/record-index/states/recordIndexRoadmapFieldStartIdState';
import { recordIndexRoadmapFieldStatusIdState } from '@/object-record/record-index/states/recordIndexRoadmapFieldStatusIdState';
import { recordIndexRoadmapShowTodayState } from '@/object-record/record-index/states/recordIndexRoadmapShowTodayState';
import { recordIndexRoadmapShowWeekendsState } from '@/object-record/record-index/states/recordIndexRoadmapShowWeekendsState';
import { recordRoadmapViewportStartComponentState } from '@/object-record/record-roadmap/states/recordRoadmapViewportStartComponentState';
import { recordRoadmapZoomComponentState } from '@/object-record/record-roadmap/states/recordRoadmapZoomComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { computeRoadmapBarLayouts } from '@/object-record/record-roadmap/utils/computeRoadmapBarLayouts';
import { computeRoadmapViewportDays } from '@/object-record/record-roadmap/utils/computeRoadmapViewportDays';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { parseRoadmapDateValue } from '@/object-record/record-roadmap/utils/computeRoadmapBarPosition';
import { computeNewPositionOfDraggedRecord } from '@/object-record/utils/computeNewPositionOfDraggedRecord';

const StyledTimelineContainer = styled.div`
  background-color: ${themeCssVariables.background.primary};
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
`;

// Two independent scroll regions side by side: the left pane scrolls only
// vertically (names), the right pane scrolls in both directions (timeline).
// A shared `scrollTop` is enforced in JS so horizontally panning the timeline
// never strands the labels — this is simpler and more reliable than
// `position: sticky` inside a horizontally-scrolling flex/grid child.
const StyledScrollRow = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  position: relative;
`;

const StyledNameColumnScroller = styled.div`
  border-right: 1px solid ${themeCssVariables.border.color.medium};
  flex-shrink: 0;
  overflow-x: hidden;
  overflow-y: hidden;
`;

const StyledTimelineCanvas = styled.div`
  flex: 1;
  overflow-x: auto;
  overflow-y: auto;
  position: relative;
`;

const StyledTimelineInner = styled.div`
  position: relative;
`;

const StyledEmpty = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[4]};
  text-align: center;
`;

const MIN_VIEWPORT_WIDTH_PX = 1200;
// Days rendered on each side of the user's anchor on first paint. Generous
// enough that short scrolls never hit an edge, small enough that the initial
// DOM stays cheap even at DAY zoom (72 px × 730 days ≈ 52k px).
const INITIAL_BUFFER_DAYS = 365;
// Extension step when the user scrolls within `EDGE_EXTEND_THRESHOLD_PX` of
// either canvas edge. Larger extensions = fewer re-renders but coarser panning.
const BUFFER_EXTENSION_DAYS = 180;
const EDGE_EXTEND_THRESHOLD_PX = 400;

export const RecordRoadmapTimeline = () => {
  const { objectMetadataItem, objectPermissions } =
    useRecordRoadmapContextOrThrow();
  const readOnly = !objectPermissions.canUpdateObjectRecords;
  // oxlint-disable-next-line twenty/no-state-useref
  const canvasRef = useRef<HTMLDivElement | null>(null);
  // oxlint-disable-next-line twenty/no-state-useref
  const nameColumnScrollerRef = useRef<HTMLDivElement | null>(null);

  const [recordRoadmapViewportStart, setRecordRoadmapViewportStart] =
    useAtomComponentState(recordRoadmapViewportStartComponentState);
  const recordRoadmapZoom = useAtomComponentStateValue(
    recordRoadmapZoomComponentState,
  );

  const recordIndexRoadmapShowToday = useAtomStateValue(
    recordIndexRoadmapShowTodayState,
  );
  const recordIndexRoadmapShowWeekends = useAtomStateValue(
    recordIndexRoadmapShowWeekendsState,
  );
  const recordIndexRoadmapFieldStartId = useAtomStateValue(
    recordIndexRoadmapFieldStartIdState,
  );
  const recordIndexRoadmapFieldEndId = useAtomStateValue(
    recordIndexRoadmapFieldEndIdState,
  );
  const recordIndexRoadmapFieldLabelId = useAtomStateValue(
    recordIndexRoadmapFieldLabelIdState,
  );
  const recordIndexRoadmapFieldColorId = useAtomStateValue(
    recordIndexRoadmapFieldColorIdState,
  );
  const recordIndexRoadmapFieldPlannedStartId = useAtomStateValue(
    recordIndexRoadmapFieldPlannedStartIdState,
  );
  const recordIndexRoadmapFieldPlannedEndId = useAtomStateValue(
    recordIndexRoadmapFieldPlannedEndIdState,
  );
  const recordIndexRoadmapFieldStatusId = useAtomStateValue(
    recordIndexRoadmapFieldStatusIdState,
  );
  const recordIndexRoadmapFieldBlockedById = useAtomStateValue(
    recordIndexRoadmapFieldBlockedByIdState,
  );

  const dayWidthPx = ROADMAP_DAY_WIDTH_BY_ZOOM[recordRoadmapZoom];

  const viewportWidthPx = Math.max(
    canvasRef.current?.clientWidth ?? MIN_VIEWPORT_WIDTH_PX,
    MIN_VIEWPORT_WIDTH_PX,
  );

  // Sliding window around `recordRoadmapViewportStart` (the user's anchor,
  // e.g. from the Today button or auto-fit). `daysBefore` / `daysAfter` grow
  // when the user scrolls near either edge; preserving `scrollLeft` across
  // extension updates keeps panning smooth with no visible jump. The window
  // resets whenever the anchor moves externally so the Today button still
  // recenters instead of leaving a stale extension in place.
  const [daysBefore, setDaysBefore] = useState(INITIAL_BUFFER_DAYS);
  const [daysAfter, setDaysAfter] = useState(INITIAL_BUFFER_DAYS);

  const renderedDaysStart = useMemo(
    () => recordRoadmapViewportStart.subtract({ days: daysBefore }),
    [recordRoadmapViewportStart, daysBefore],
  );

  const visibleDays = Math.max(
    Math.ceil(viewportWidthPx / Math.max(dayWidthPx, 1)),
    1,
  );
  const totalDays = daysBefore + visibleDays + daysAfter;

  const { days } = computeRoadmapViewportDays({
    renderedDaysStart,
    totalDays,
  });

  const canvasWidthPx = days.length * dayWidthPx;

  const { records, startFieldMetadataItem, endFieldMetadataItem } =
    useRecordRoadmapFetchRecords();

  const { updateDates } = useRecordRoadmapUpdateDates();
  const { createAtDay } = useRecordRoadmapCreateOnDoubleClick();
  const { openRecordFromIndexView } = useOpenRecordFromIndexView();

  const handleOpenRecord = useCallback(
    (clickedRecordId: string) => {
      openRecordFromIndexView({ recordId: clickedRecordId });
    },
    [openRecordFromIndexView],
  );

  useRecordRoadmapWheelZoom(canvasRef);

  const labelFieldMetadataItem = useMemo(() => {
    if (isDefined(recordIndexRoadmapFieldLabelId)) {
      return objectMetadataItem.fields.find(
        (field) => field.id === recordIndexRoadmapFieldLabelId,
      );
    }
    return objectMetadataItem.fields.find(
      (field) => field.id === objectMetadataItem.labelIdentifierFieldMetadataId,
    );
  }, [recordIndexRoadmapFieldLabelId, objectMetadataItem]);

  // Color field is a SELECT: we match each record's value against the
  // field's `options` array and surface the option's `color` (already a
  // theme token like 'blue', 'red', etc.). NULL when unconfigured or when
  // the record's value doesn't match any option — the bar then falls back
  // to the neutral default styling.
  const colorFieldMetadataItem = useMemo(() => {
    if (!isDefined(recordIndexRoadmapFieldColorId)) return undefined;
    return objectMetadataItem.fields.find(
      (field) => field.id === recordIndexRoadmapFieldColorId,
    );
  }, [recordIndexRoadmapFieldColorId, objectMetadataItem]);

  const plannedStartFieldMetadataItem = useMemo(() => {
    if (!isDefined(recordIndexRoadmapFieldPlannedStartId)) return undefined;
    return objectMetadataItem.fields.find(
      (field) => field.id === recordIndexRoadmapFieldPlannedStartId,
    );
  }, [recordIndexRoadmapFieldPlannedStartId, objectMetadataItem]);

  const plannedEndFieldMetadataItem = useMemo(() => {
    if (!isDefined(recordIndexRoadmapFieldPlannedEndId)) return undefined;
    return objectMetadataItem.fields.find(
      (field) => field.id === recordIndexRoadmapFieldPlannedEndId,
    );
  }, [recordIndexRoadmapFieldPlannedEndId, objectMetadataItem]);

  const statusFieldMetadataItem = useMemo(() => {
    if (!isDefined(recordIndexRoadmapFieldStatusId)) return undefined;
    return objectMetadataItem.fields.find(
      (field) => field.id === recordIndexRoadmapFieldStatusId,
    );
  }, [recordIndexRoadmapFieldStatusId, objectMetadataItem]);

  const blockedByFieldMetadataItem = useMemo(() => {
    if (!isDefined(recordIndexRoadmapFieldBlockedById)) return undefined;
    return objectMetadataItem.fields.find(
      (field) => field.id === recordIndexRoadmapFieldBlockedById,
    );
  }, [recordIndexRoadmapFieldBlockedById, objectMetadataItem]);

  const placedRecords = useMemo(() => {
    if (
      !isDefined(startFieldMetadataItem) ||
      !isDefined(endFieldMetadataItem)
    ) {
      return [];
    }
    const colorOptions = colorFieldMetadataItem?.options ?? [];
    return records
      .map((record) => {
        const startValue = record[startFieldMetadataItem.name];
        const endValue = record[endFieldMetadataItem.name];
        // When the configured `start`/`end` fields are empty (e.g.
        // milestone not started yet so actualStart/actualEnd are null),
        // fall back to plannedStart/plannedEnd so the bar still renders.
        // No-op for views that don't configure plannedStart/plannedEnd.
        let startDate = parseRoadmapDateValue(startValue);
        if (startDate === null && plannedStartFieldMetadataItem !== undefined) {
          startDate = parseRoadmapDateValue(
            record[plannedStartFieldMetadataItem.name],
          );
        }
        let endDate = parseRoadmapDateValue(endValue);
        if (endDate === null && plannedEndFieldMetadataItem !== undefined) {
          endDate = parseRoadmapDateValue(
            record[plannedEndFieldMetadataItem.name],
          );
        }
        if (startDate === null || endDate === null) {
          return null;
        }
        const label =
          labelFieldMetadataItem !== undefined
            ? String(record[labelFieldMetadataItem.name] ?? record.id)
            : record.id;
        let color: string | null = null;
        if (colorFieldMetadataItem !== undefined) {
          const rawValue = record[colorFieldMetadataItem.name];
          if (typeof rawValue === 'string' && rawValue.length > 0) {
            color =
              colorOptions.find((option) => option.value === rawValue)?.color ??
              null;
          }
        }
        const plannedStartDate =
          plannedStartFieldMetadataItem !== undefined
            ? parseRoadmapDateValue(
                record[plannedStartFieldMetadataItem.name],
              )
            : null;
        const plannedEndDate =
          plannedEndFieldMetadataItem !== undefined
            ? parseRoadmapDateValue(
                record[plannedEndFieldMetadataItem.name],
              )
            : null;
        const status =
          statusFieldMetadataItem !== undefined
            ? (() => {
                const raw = record[statusFieldMetadataItem.name];
                return typeof raw === 'string' && raw.length > 0 ? raw : null;
              })()
            : null;
        const blockedBy =
          blockedByFieldMetadataItem !== undefined
            ? (() => {
                const raw = record[blockedByFieldMetadataItem.name];
                return typeof raw === 'string' && raw.length > 0 ? raw : null;
              })()
            : null;
        return {
          record,
          startDate,
          endDate,
          label,
          color,
          plannedStartDate,
          plannedEndDate,
          status,
          blockedBy,
        };
      })
      .filter(isDefined);
  }, [
    records,
    startFieldMetadataItem,
    endFieldMetadataItem,
    labelFieldMetadataItem,
    colorFieldMetadataItem,
    plannedStartFieldMetadataItem,
    plannedEndFieldMetadataItem,
    statusFieldMetadataItem,
    blockedByFieldMetadataItem,
  ]);

  const { swimlanes, groupFieldName, supportsCrossSwimlaneDrop } =
    useRecordRoadmapSwimlanes({ placedRecords });

  const { currentView } = useGetCurrentViewOnly();

  // Visible view-fields define the columns the name column renders next to
  // each milestone label. Skip the configured `start`/`end` (rendered as the
  // bar itself) and the `label` (rendered as the row title) — those are
  // already represented elsewhere on the timeline.
  const nameColumnFields = useMemo(() => {
    if (!currentView?.viewFields) return [];
    const labelOrAnchorIds = new Set(
      [
        recordIndexRoadmapFieldStartId,
        recordIndexRoadmapFieldEndId,
        recordIndexRoadmapFieldLabelId,
        labelFieldMetadataItem?.id,
      ].filter(isDefined),
    );
    return currentView.viewFields
      .filter((viewField) => viewField.isVisible)
      .filter((viewField) => !labelOrAnchorIds.has(viewField.fieldMetadataId))
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((viewField) =>
        objectMetadataItem.fields.find(
          (field) => field.id === viewField.fieldMetadataId,
        ),
      )
      .filter(isDefined);
  }, [
    currentView?.viewFields,
    recordIndexRoadmapFieldStartId,
    recordIndexRoadmapFieldEndId,
    recordIndexRoadmapFieldLabelId,
    labelFieldMetadataItem?.id,
    objectMetadataItem.fields,
  ]);

  // Bar layouts indexed by recordId. Mirrors the deterministic vertical
  // stacking the swimlane CSS uses, so the SVG connector overlay aligns
  // pixel-for-pixel with the bars without DOM measurement.
  const barLayouts = useMemo(
    () =>
      computeRoadmapBarLayouts({
        swimlanes,
        viewportStart: renderedDaysStart,
        dayWidthPx,
      }),
    [swimlanes, renderedDaysStart, dayWidthPx],
  );

  // Dependencies are only meaningful when the underlying object is
  // OpportunityMilestone (where the schema lives). The hook is gated by
  // `enabled` so other objects don't pay for an extra fetch.
  const isMilestoneObject =
    objectMetadataItem.nameSingular === 'opportunityMilestone';
  const milestoneRecordIds = useMemo(
    () => placedRecords.map(({ record }) => record.id),
    [placedRecords],
  );
  const { dependencies } = useRecordRoadmapDependencies({
    recordIds: milestoneRecordIds,
    enabled: isMilestoneObject,
  });

  const swimlaneStackHeightPx = useMemo(() => {
    let total = 0;
    for (const swimlane of swimlanes) {
      total += 28 + swimlane.records.length * 40;
    }
    return total;
  }, [swimlanes]);
  const canvasHeightPx = 48 + swimlaneStackHeightPx;

  // Keep scrollLeft stable whenever `daysBefore` grows (new days prepended to
  // the canvas push existing content right by the delta's pixel equivalent).
  // oxlint-disable-next-line twenty/no-state-useref
  const previousDaysBeforeRef = useRef(daysBefore);
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;
    const delta = daysBefore - previousDaysBeforeRef.current;
    previousDaysBeforeRef.current = daysBefore;
    if (delta !== 0) {
      canvas.scrollLeft += delta * dayWidthPx;
    }
  }, [daysBefore, dayWidthPx]);

  // When the user's anchor changes (Today button, auto-fit), reset the
  // sliding window symmetrically and snap the scroll to the anchor so the
  // jump feels intentional instead of accidental. Reference (not value)
  // equality guards re-entry — we want "Go today" to re-snap even when
  // today-7d happens to match the current anchor's value, because the
  // user may have scrolled away and expects a jump back.
  // oxlint-disable-next-line twenty/no-state-useref
  const previousAnchorRef = useRef(recordRoadmapViewportStart);
  useLayoutEffect(() => {
    if (previousAnchorRef.current === recordRoadmapViewportStart) {
      return;
    }
    previousAnchorRef.current = recordRoadmapViewportStart;
    setDaysBefore(INITIAL_BUFFER_DAYS);
    setDaysAfter(INITIAL_BUFFER_DAYS);
    previousDaysBeforeRef.current = INITIAL_BUFFER_DAYS;
    const canvas = canvasRef.current;
    if (canvas !== null) {
      canvas.scrollLeft = INITIAL_BUFFER_DAYS * dayWidthPx;
    }
  }, [recordRoadmapViewportStart, dayWidthPx]);

  // First paint: scroll so the anchor sits at the left edge of the viewport.
  // oxlint-disable-next-line twenty/no-state-useref
  const hasSetInitialScrollRef = useRef(false);
  useLayoutEffect(() => {
    if (hasSetInitialScrollRef.current) return;
    const canvas = canvasRef.current;
    if (canvas === null) return;
    hasSetInitialScrollRef.current = true;
    canvas.scrollLeft = daysBefore * dayWidthPx;
  }, [daysBefore, dayWidthPx]);

  // Extend the window when scroll approaches an edge, and mirror the
  // vertical scroll onto the sticky name-column scroller so the two panes
  // stay row-for-row aligned. `scrollTop` assignment here is a no-op when
  // it already matches, so the guard is implicit.
  const handleCanvasScroll = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;
    if (canvas.scrollLeft < EDGE_EXTEND_THRESHOLD_PX) {
      setDaysBefore((previous) => previous + BUFFER_EXTENSION_DAYS);
    }
    if (
      canvas.scrollWidth - canvas.scrollLeft - canvas.clientWidth <
      EDGE_EXTEND_THRESHOLD_PX
    ) {
      setDaysAfter((previous) => previous + BUFFER_EXTENSION_DAYS);
    }
    const nameColumnScroller = nameColumnScrollerRef.current;
    if (
      nameColumnScroller !== null &&
      nameColumnScroller.scrollTop !== canvas.scrollTop
    ) {
      nameColumnScroller.scrollTop = canvas.scrollTop;
    }
  }, []);

  // Re-anchor the viewport to (earliest placed record - 7 days) only on the
  // first successful load. Zoom changes no longer re-snap — that used to
  // feel like an involuntary "Go today" every time the user switched
  // Day/Week/Quarter. Instead, `useLayoutEffect` below rescales scrollLeft
  // so the visible date stays put across zoom transitions.
  // oxlint-disable-next-line twenty/no-state-useref
  const hasAutoFittedRef = useRef(false);
  useEffect(() => {
    if (hasAutoFittedRef.current || placedRecords.length === 0) return;
    hasAutoFittedRef.current = true;
    const earliest = placedRecords.reduce<Temporal.PlainDate>(
      (acc, placed) =>
        Temporal.PlainDate.compare(placed.startDate, acc) < 0
          ? placed.startDate
          : acc,
      placedRecords[0].startDate,
    );
    const anchored = earliest.subtract({ days: 7 });
    if (
      Temporal.PlainDate.compare(anchored, recordRoadmapViewportStart) !== 0
    ) {
      setRecordRoadmapViewportStart(anchored);
    }
  }, [
    placedRecords,
    recordRoadmapViewportStart,
    setRecordRoadmapViewportStart,
  ]);

  // Preserve the visible date across zoom changes by scaling `scrollLeft`
  // in lock-step with `dayWidthPx`. Runs as a layout effect so the re-paint
  // at the new zoom sees the correct scroll position on the same frame
  // (avoids a visible jump).
  // oxlint-disable-next-line twenty/no-state-useref
  const previousDayWidthPxRef = useRef(dayWidthPx);
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;
    const previous = previousDayWidthPxRef.current;
    previousDayWidthPxRef.current = dayWidthPx;
    if (previous === dayWidthPx || previous === 0) return;
    canvas.scrollLeft = (canvas.scrollLeft * dayWidthPx) / previous;
  }, [dayWidthPx]);

  const handleDoubleClickEmptyArea = useCallback(
    ({ swimlaneKey, clientX }: { swimlaneKey: string; clientX: number }) => {
      const canvas = canvasRef.current;
      if (canvas === null) return;
      const canvasRect = canvas.getBoundingClientRect();
      // The name column is a separate scroller outside the canvas, so the
      // canvas's left edge already aligns with the start of the timeline.
      const offsetX = clientX - canvasRect.left + canvas.scrollLeft;
      const dayIndex = Math.max(0, Math.floor(offsetX / dayWidthPx));
      const startDate = renderedDaysStart.add({ days: dayIndex });
      const endDate = startDate.add({ days: 3 });

      void createAtDay({
        startDate,
        endDate,
        startFieldName: startFieldMetadataItem?.name,
        endFieldName: endFieldMetadataItem?.name,
        groupFieldName: supportsCrossSwimlaneDrop ? groupFieldName : null,
        swimlaneKey,
      });
    },
    [
      dayWidthPx,
      renderedDaysStart,
      createAtDay,
      startFieldMetadataItem,
      endFieldMetadataItem,
      supportsCrossSwimlaneDrop,
      groupFieldName,
    ],
  );

  const handleBarCommit = useCallback(
    ({
      recordId,
      startDate,
      endDate,
      targetSwimlaneKey,
      targetRowRecordId,
    }: {
      recordId: string;
      startDate: Temporal.PlainDate;
      endDate: Temporal.PlainDate;
      targetSwimlaneKey?: string | null;
      targetRowRecordId?: string | null;
    }) => {
      // Reorder-by-position path. Resolve the swimlane the source currently
      // lives in, pick records with a numeric `position`, and hand off to
      // the shared Kanban helper so ordering math (intermediary halves,
      // first/last edge cases) is identical across views.
      if (isDefined(targetRowRecordId) && targetRowRecordId !== recordId) {
        const sourceSwimlane = swimlanes.find((swimlane) =>
          swimlane.records.some(({ record }) => record.id === recordId),
        );
        if (!isDefined(sourceSwimlane)) {
          return;
        }
        const recordsWithPosition = sourceSwimlane.records
          .map(({ record }) =>
            typeof record.position === 'number'
              ? { id: record.id, position: record.position }
              : null,
          )
          .filter(isDefined);
        const targetHasPosition = recordsWithPosition.some(
          ({ id }) => id === targetRowRecordId,
        );
        if (!targetHasPosition) return;

        const newPosition = computeNewPositionOfDraggedRecord({
          arrayOfRecordsWithPosition: recordsWithPosition,
          idOfItemToMove: recordId,
          idOfTargetItem: targetRowRecordId,
          isDroppedAfterList: false,
        });

        void updateDates({ recordId, position: newPosition });
        return;
      }

      const canUpdateGroup =
        supportsCrossSwimlaneDrop &&
        isDefined(groupFieldName) &&
        targetSwimlaneKey !== undefined;

      void updateDates({
        recordId,
        startFieldName: startFieldMetadataItem?.name,
        endFieldName: endFieldMetadataItem?.name,
        startDate,
        endDate,
        groupFieldName: canUpdateGroup ? groupFieldName : undefined,
        groupValue: canUpdateGroup
          ? targetSwimlaneKey === ROADMAP_UNCATEGORIZED_SWIMLANE_KEY
            ? null
            : (targetSwimlaneKey ?? null)
          : undefined,
      });
    },
    [
      updateDates,
      startFieldMetadataItem,
      endFieldMetadataItem,
      supportsCrossSwimlaneDrop,
      groupFieldName,
      swimlanes,
    ],
  );

  if (!isDefined(startFieldMetadataItem) || !isDefined(endFieldMetadataItem)) {
    return (
      <StyledEmpty>
        This Roadmap view is missing its start or end field. Open the view
        options to configure the timeline.
      </StyledEmpty>
    );
  }

  return (
    <StyledTimelineContainer>
      <StyledScrollRow>
        <StyledNameColumnScroller
          ref={nameColumnScrollerRef}
          style={{
            width:
              ROADMAP_NAME_COLUMN_WIDTH +
              nameColumnFields.length * ROADMAP_NAME_COLUMN_FIELD_WIDTH,
          }}
        >
          <RecordRoadmapNameColumn
            swimlanes={swimlanes}
            onOpenRecord={handleOpenRecord}
            extraFields={nameColumnFields}
          />
        </StyledNameColumnScroller>
        <StyledTimelineCanvas ref={canvasRef} onScroll={handleCanvasScroll}>
          <StyledTimelineInner style={{ width: canvasWidthPx }}>
            <RecordRoadmapTimeHeader
              days={days}
              viewportStart={renderedDaysStart}
              dayWidthPx={dayWidthPx}
              zoom={recordRoadmapZoom}
            />
            {recordIndexRoadmapShowWeekends && (
              <RecordRoadmapWeekendsOverlay
                days={days}
                viewportStart={renderedDaysStart}
                dayWidthPx={dayWidthPx}
              />
            )}
            {swimlanes.map((swimlane) => (
              <RecordRoadmapSwimlane
                key={swimlane.key}
                swimlaneKey={swimlane.key}
                onDoubleClickEmptyArea={
                  readOnly ? undefined : handleDoubleClickEmptyArea
                }
              >
                {swimlane.records.map(
                  ({
                    record,
                    startDate,
                    endDate,
                    label,
                    color,
                    plannedStartDate,
                    plannedEndDate,
                    status,
                    blockedBy,
                  }) => (
                    <RecordRoadmapRow
                      key={record.id}
                      recordId={record.id}
                      label={label}
                      startDate={startDate}
                      endDate={endDate}
                      plannedStartDate={plannedStartDate}
                      plannedEndDate={plannedEndDate}
                      status={status}
                      blockedBy={blockedBy}
                      viewportStart={renderedDaysStart}
                      dayWidthPx={dayWidthPx}
                      color={color}
                      currentSwimlaneKey={swimlane.key}
                      readOnly={readOnly}
                      onCommit={handleBarCommit}
                      onOpenRecord={handleOpenRecord}
                    />
                  ),
                )}
              </RecordRoadmapSwimlane>
            ))}
            {recordIndexRoadmapShowToday && (
              <RecordRoadmapTodayLine
                viewportStart={renderedDaysStart}
                dayWidthPx={dayWidthPx}
              />
            )}
            {isMilestoneObject && (
              <RecordRoadmapDependencyConnectors
                dependencies={dependencies}
                barLayouts={barLayouts}
                canvasWidthPx={canvasWidthPx}
                canvasHeightPx={canvasHeightPx}
              />
            )}
          </StyledTimelineInner>
        </StyledTimelineCanvas>
      </StyledScrollRow>
    </StyledTimelineContainer>
  );
};
