import { useMemo } from 'react';
import { type Temporal } from 'temporal-polyfill';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useRecordRoadmapContextOrThrow } from '@/object-record/record-roadmap/contexts/RecordRoadmapContext';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { recordIndexRoadmapFieldGroupIdState } from '@/object-record/record-index/states/recordIndexRoadmapFieldGroupIdState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export type RoadmapPlacedRecord = {
  record: ObjectRecord;
  startDate: Temporal.PlainDate;
  endDate: Temporal.PlainDate;
  label: string;
  /** SELECT-option color resolved from the view's `roadmapFieldColorId`. */
  color: string | null;
  /** Originally planned start date — pairs with `plannedEndDate` to
      draw the dashed ghost bar showing the original plan range.
      Null when the view has no `roadmapFieldPlannedStart` configured. */
  plannedStartDate: Temporal.PlainDate | null;
  /** Originally planned end date — null when the view has no
      `roadmapFieldPlannedEnd` configured or the record is missing one.
      Drives the dashed ghost bar + overdue indicator (Fase 6.4). */
  plannedEndDate: Temporal.PlainDate | null;
  /** Raw SELECT value of the status field — null when unconfigured. Used
      to gate the overdue indicator (DONE/CANCELLED never glow red). */
  status: string | null;
  /** Raw SELECT value of the blockedBy field — null when unconfigured or
      'NONE'. Drives the lock badge + tinted overlay (Fase 6.4). */
  blockedBy: string | null;
};

export type RoadmapSwimlane = {
  key: string;
  label: string;
  color?: string | null;
  records: RoadmapPlacedRecord[];
};

export const ROADMAP_UNCATEGORIZED_SWIMLANE_KEY = '__uncategorized__';

type UseRecordRoadmapSwimlanesArgs = {
  placedRecords: RoadmapPlacedRecord[];
};

type UseRecordRoadmapSwimlanesResult = {
  swimlanes: RoadmapSwimlane[];
  /** Field name the swimlane key maps back to for updateOneRecord.
      `null` when the view has no group field configured. */
  groupFieldName: string | null;
  /** Whether vertical drag may change the group. RELATION grouping is
      intentionally read-only in the MVP (see PRD §3.3). */
  supportsCrossSwimlaneDrop: boolean;
};

// Groups roadmap records by the SELECT option configured as
// `roadmapFieldGroupId` on the current view — or, as a fallback, by the
// generic `recordIndexGroupFieldMetadataItem` the user just picked from the
// shared Group menu. The roadmap-specific column wins when both are set so
// the view-level configuration survives reloads; the shared atom covers the
// "set Group = Stage on the sidebar" path users expect from Kanban.
// If neither is set or the field is RELATION, the timeline falls back to a
// single swimlane. The returned swimlane `key` is either the SELECT option
// `value` or the sentinel `__uncategorized__` for records whose group field
// is null.
export const useRecordRoadmapSwimlanes = ({
  placedRecords,
}: UseRecordRoadmapSwimlanesArgs): UseRecordRoadmapSwimlanesResult => {
  const { objectMetadataItem } = useRecordRoadmapContextOrThrow();
  const recordIndexRoadmapFieldGroupId = useAtomStateValue(
    recordIndexRoadmapFieldGroupIdState,
  );
  const recordIndexGroupFieldMetadataItem = useAtomComponentStateValue(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const groupField = useMemo(() => {
    if (isDefined(recordIndexRoadmapFieldGroupId)) {
      return (
        objectMetadataItem.fields.find(
          (field) => field.id === recordIndexRoadmapFieldGroupId,
        ) ?? null
      );
    }
    return recordIndexGroupFieldMetadataItem ?? null;
  }, [
    recordIndexRoadmapFieldGroupId,
    recordIndexGroupFieldMetadataItem,
    objectMetadataItem,
  ]);

  // Records inside each swimlane are sorted ascending by the record's
  // `position` field so vertical-drag reorders persist across reloads.
  // Ties (or missing position on freshly-created records) fall back to the
  // label for deterministic rendering. Fields are fetched by
  // `useRelevantRecordsGqlFields` when the object exposes `position`.
  const sortByPositionThenLabel = (
    a: RoadmapPlacedRecord,
    b: RoadmapPlacedRecord,
  ) => {
    const aPosition =
      typeof a.record.position === 'number'
        ? a.record.position
        : Number.POSITIVE_INFINITY;
    const bPosition =
      typeof b.record.position === 'number'
        ? b.record.position
        : Number.POSITIVE_INFINITY;
    if (aPosition !== bPosition) return aPosition - bPosition;
    return a.label.localeCompare(b.label);
  };

  return useMemo<UseRecordRoadmapSwimlanesResult>(() => {
    if (groupField === null) {
      return {
        swimlanes: [
          {
            key: ROADMAP_UNCATEGORIZED_SWIMLANE_KEY,
            label: 'All records',
            records: placedRecords.slice().sort(sortByPositionThenLabel),
          },
        ],
        groupFieldName: null,
        supportsCrossSwimlaneDrop: false,
      };
    }

    const supportsCrossSwimlaneDrop =
      groupField.type === FieldMetadataType.SELECT;

    if (groupField.type === FieldMetadataType.RELATION) {
      // RELATION grouping: one swimlane per distinct related record. Reads
      // `record[fieldName].id` for the bucket key and `record[fieldName].name`
      // for the label (the fetch hook requests `{id,name}` for RELATION group
      // fields explicitly). Cross-swimlane drop is disabled because changing
      // a milestone's parent Opportunity from a Gantt drag is rarely the
      // intended action — users edit the relation from the record drawer.
      const byRelationId = new Map<
        string,
        { label: string; records: RoadmapPlacedRecord[] }
      >();
      const uncategorized: RoadmapPlacedRecord[] = [];

      for (const placed of placedRecords) {
        const rawValue = placed.record[groupField.name];
        if (
          rawValue !== null &&
          typeof rawValue === 'object' &&
          'id' in rawValue &&
          typeof (rawValue as { id: unknown }).id === 'string'
        ) {
          const relatedId = (rawValue as { id: string }).id;
          const relatedName =
            'name' in rawValue && typeof (rawValue as { name: unknown }).name === 'string'
              ? (rawValue as { name: string }).name
              : relatedId;
          const bucket = byRelationId.get(relatedId) ?? {
            label: relatedName,
            records: [],
          };
          bucket.records.push(placed);
          byRelationId.set(relatedId, bucket);
        } else {
          uncategorized.push(placed);
        }
      }

      const swimlanes: RoadmapSwimlane[] = Array.from(byRelationId.entries())
        .sort(([, a], [, b]) => a.label.localeCompare(b.label))
        .map(([relatedId, bucket]) => ({
          key: relatedId,
          label: bucket.label,
          records: bucket.records.slice().sort(sortByPositionThenLabel),
        }));

      if (uncategorized.length > 0) {
        swimlanes.push({
          key: ROADMAP_UNCATEGORIZED_SWIMLANE_KEY,
          label: 'Uncategorized',
          records: uncategorized.slice().sort(sortByPositionThenLabel),
        });
      }

      return {
        swimlanes,
        groupFieldName: groupField.name,
        supportsCrossSwimlaneDrop: false,
      };
    }

    if (groupField.type !== FieldMetadataType.SELECT) {
      // Other field types fall back to a single bucket (Fase 4b legacy).
      return {
        swimlanes: [
          {
            key: ROADMAP_UNCATEGORIZED_SWIMLANE_KEY,
            label: groupField.label ?? 'Group',
            records: placedRecords.slice().sort(sortByPositionThenLabel),
          },
        ],
        groupFieldName: groupField.name,
        supportsCrossSwimlaneDrop: false,
      };
    }

    const options = groupField.options ?? [];
    const byValue = new Map<string, RoadmapPlacedRecord[]>();
    const uncategorized: RoadmapPlacedRecord[] = [];

    for (const placed of placedRecords) {
      const rawValue = placed.record[groupField.name];
      if (
        typeof rawValue === 'string' &&
        rawValue.length > 0 &&
        options.some((option) => option.value === rawValue)
      ) {
        const bucket = byValue.get(rawValue) ?? [];
        bucket.push(placed);
        byValue.set(rawValue, bucket);
      } else {
        uncategorized.push(placed);
      }
    }

    const swimlanes: RoadmapSwimlane[] = options
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((option) => ({
        key: option.value,
        label: option.label,
        color: option.color,
        records: (byValue.get(option.value) ?? [])
          .slice()
          .sort(sortByPositionThenLabel),
      }));

    if (uncategorized.length > 0) {
      swimlanes.push({
        key: ROADMAP_UNCATEGORIZED_SWIMLANE_KEY,
        label: 'Uncategorized',
        records: uncategorized.slice().sort(sortByPositionThenLabel),
      });
    }

    return {
      swimlanes,
      groupFieldName: groupField.name,
      supportsCrossSwimlaneDrop,
    };
  }, [groupField, placedRecords]);
};
