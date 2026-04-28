import { styled } from '@linaria/react';
import { Temporal } from 'temporal-polyfill';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { recordIndexRoadmapShowDeviationState } from '@/object-record/record-index/states/recordIndexRoadmapShowDeviationState';
import {
  ROADMAP_HEADER_HEIGHT,
  ROADMAP_NAME_COLUMN_FIELD_WIDTH,
  ROADMAP_NAME_COLUMN_WIDTH,
  ROADMAP_ROW_HEIGHT,
  ROADMAP_SWIMLANE_HEADER_HEIGHT,
} from '@/object-record/record-roadmap/constants/RoadmapDimensions';
import { computeRoadmapDeviation } from '@/object-record/record-roadmap/hooks/useRecordRoadmapDeviation';
import {
  type RoadmapPlacedRecord,
  type RoadmapSwimlane,
} from '@/object-record/record-roadmap/hooks/useRecordRoadmapSwimlanes';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

// Lives inside its own dedicated vertical scroller (`StyledNameColumnScroller`
// in RecordRoadmapTimeline); the timeline's onScroll handler mirrors its
// scrollTop onto the scroller so the two panes always show the same rows.
const StyledColumn = styled.div`
  background-color: ${themeCssVariables.background.primary};
`;

// Pinned at the top of the name-column scroller so it mirrors the timeline's
// sticky time header: vertical scroll slides the labels underneath, but this
// header stays put. Renders the column titles when extra view-fields are
// configured, otherwise a blank spacer.
const StyledHeaderRow = styled.div`
  background-color: ${themeCssVariables.background.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  display: flex;
  height: ${ROADMAP_HEADER_HEIGHT}px;
  position: sticky;
  top: 0;
  z-index: 1;
`;

const StyledHeaderCell = styled.div`
  align-items: center;
  border-right: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  overflow: hidden;
  padding: 0 ${themeCssVariables.spacing[2]};
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;

  &:last-child {
    border-right: none;
  }
`;

const StyledSwimlaneGroup = styled.div`
  position: relative;
`;

const StyledSwimlaneHeader = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.tertiary};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  height: ${ROADMAP_SWIMLANE_HEADER_HEIGHT}px;
  padding: 0 ${themeCssVariables.spacing[2]};
`;

const StyledColorDot = styled.span`
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
  height: 8px;
  width: 8px;
`;

// Pushes the deviation chip to the right edge of the swimlane header.
const StyledHeaderRightSlot = styled.span`
  margin-left: auto;
`;

// Pill-shaped indicator used as a "+Nd" deviation badge in the swimlane
// header. Reuses the danger token palette so it matches the bar's overdue
// border, and stays compact enough to fit on a 28 px header strip.
const StyledDeviationBadge = styled.span`
  background-color: ${themeCssVariables.tag.background.red};
  border-radius: 999px;
  color: ${themeCssVariables.tag.text.red};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: 0.02em;
  padding: 1px ${themeCssVariables.spacing[2]};
`;

const StyledNameRow = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  height: ${ROADMAP_ROW_HEIGHT}px;

  &:hover {
    background-color: ${themeCssVariables.background.secondary};
  }
`;

const StyledNameCell = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  overflow: hidden;
  padding: 0 ${themeCssVariables.spacing[2]};
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledFieldCell = styled.div`
  align-items: center;
  border-left: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  overflow: hidden;
  padding: 0 ${themeCssVariables.spacing[2]};
  text-overflow: ellipsis;
  white-space: nowrap;
`;

// Compact SELECT chip that mirrors the deviation badge silhouette so the
// name column reads as a single visual family.
const StyledSelectChip = styled.span`
  border-radius: 999px;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  max-width: 100%;
  overflow: hidden;
  padding: 1px ${themeCssVariables.spacing[2]};
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledMutedText = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
`;

type FieldCellProps = {
  field: FieldMetadataItem;
  record: RoadmapPlacedRecord['record'];
};

// Maps SELECT option `color` tokens (theme color names like 'blue', 'red')
// to background/text variables. Falls back to neutral grey when the option
// has no color or the token isn't in the tag palette.
const SELECT_CHIP_BACKGROUNDS: Record<string, string> = {
  green: themeCssVariables.tag.background.green,
  turquoise: themeCssVariables.tag.background.turquoise,
  sky: themeCssVariables.tag.background.sky,
  blue: themeCssVariables.tag.background.blue,
  purple: themeCssVariables.tag.background.purple,
  pink: themeCssVariables.tag.background.pink,
  red: themeCssVariables.tag.background.red,
  orange: themeCssVariables.tag.background.orange,
  yellow: themeCssVariables.tag.background.yellow,
  gray: themeCssVariables.tag.background.gray,
};

const SELECT_CHIP_TEXT_COLORS: Record<string, string> = {
  green: themeCssVariables.tag.text.green,
  turquoise: themeCssVariables.tag.text.turquoise,
  sky: themeCssVariables.tag.text.sky,
  blue: themeCssVariables.tag.text.blue,
  purple: themeCssVariables.tag.text.purple,
  pink: themeCssVariables.tag.text.pink,
  red: themeCssVariables.tag.text.red,
  orange: themeCssVariables.tag.text.orange,
  yellow: themeCssVariables.tag.text.yellow,
  gray: themeCssVariables.tag.text.gray,
};

// Best-effort cell renderer keyed by FieldMetadataType. The Roadmap fetch
// hook already requests the visible view-fields' values in the GQL response
// (and `{id,name}` for RELATION), so reading `record[field.name]` here is
// safe. Anything we can't recognize falls back to a stringified value.
const FieldCell = ({ field, record }: FieldCellProps) => {
  const value = record[field.name];

  if (!isDefined(value) || value === '') {
    return <StyledMutedText>—</StyledMutedText>;
  }

  if (field.type === FieldMetadataType.SELECT) {
    if (typeof value !== 'string') {
      return <StyledMutedText>—</StyledMutedText>;
    }
    const option = field.options?.find((entry) => entry.value === value);
    const label = option?.label ?? value;
    const colorKey = option?.color;
    const backgroundColor = colorKey
      ? (SELECT_CHIP_BACKGROUNDS[colorKey] ??
        themeCssVariables.tag.background.gray)
      : themeCssVariables.tag.background.gray;
    const textColor = colorKey
      ? (SELECT_CHIP_TEXT_COLORS[colorKey] ?? themeCssVariables.tag.text.gray)
      : themeCssVariables.tag.text.gray;
    return (
      <StyledSelectChip
        title={label}
        style={{ backgroundColor, color: textColor }}
      >
        {label}
      </StyledSelectChip>
    );
  }

  if (field.type === FieldMetadataType.MULTI_SELECT) {
    if (!Array.isArray(value)) {
      return <StyledMutedText>—</StyledMutedText>;
    }
    const text = value.join(', ');
    return <span title={text}>{text}</span>;
  }

  if (
    field.type === FieldMetadataType.DATE_TIME ||
    field.type === FieldMetadataType.DATE
  ) {
    if (typeof value !== 'string') {
      return <StyledMutedText>—</StyledMutedText>;
    }
    try {
      const plainDate = Temporal.PlainDate.from(value.slice(0, 10));
      const text = plainDate.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      return <span title={text}>{text}</span>;
    } catch {
      return <span>{value}</span>;
    }
  }

  if (field.type === FieldMetadataType.RELATION) {
    if (typeof value !== 'object' || value === null) {
      return <StyledMutedText>—</StyledMutedText>;
    }
    const related = value as { name?: unknown; id?: unknown };
    const text =
      typeof related.name === 'string' && related.name.length > 0
        ? related.name
        : typeof related.id === 'string'
          ? related.id
          : '—';
    return <span title={text}>{text}</span>;
  }

  if (field.type === FieldMetadataType.NUMBER) {
    return <span>{String(value)}</span>;
  }

  if (field.type === FieldMetadataType.BOOLEAN) {
    return <span>{value ? '✓' : '—'}</span>;
  }

  // FULL_NAME / EMAILS / PHONES / LINKS / ADDRESS arrive as objects with a
  // `primaryX` field. Pull a sensible "first display" without modeling each.
  if (typeof value === 'object' && value !== null) {
    const candidate = value as Record<string, unknown>;
    const primary =
      candidate.primaryEmail ??
      candidate.primaryPhoneNumber ??
      candidate.primaryLinkUrl ??
      candidate.firstName ??
      candidate.label ??
      candidate.value ??
      candidate.text;
    if (typeof primary === 'string' && primary.length > 0) {
      return <span title={primary}>{primary}</span>;
    }
    return <StyledMutedText>—</StyledMutedText>;
  }

  return <span title={String(value)}>{String(value)}</span>;
};

type RecordRoadmapNameColumnProps = {
  swimlanes: RoadmapSwimlane[];
  onOpenRecord?: (recordId: string) => void;
  extraFields?: FieldMetadataItem[];
};

export const RecordRoadmapNameColumn = ({
  swimlanes,
  onOpenRecord,
  extraFields = [],
}: RecordRoadmapNameColumnProps) => {
  const recordIndexRoadmapShowDeviation = useAtomStateValue(recordIndexRoadmapShowDeviationState);
  // Compute today once for all swimlane headers — avoids each placed record
  // reading the wall clock independently and keeps the badge stable across
  // the same render pass.
  const today = Temporal.Now.plainDateISO();
  const totalWidth =
    ROADMAP_NAME_COLUMN_WIDTH +
    extraFields.length * ROADMAP_NAME_COLUMN_FIELD_WIDTH;
  return (
    <StyledColumn style={{ width: totalWidth }}>
      <StyledHeaderRow>
        <StyledHeaderCell style={{ width: ROADMAP_NAME_COLUMN_WIDTH }}>
          Name
        </StyledHeaderCell>
        {extraFields.map((field) => (
          <StyledHeaderCell
            key={field.id}
            style={{ width: ROADMAP_NAME_COLUMN_FIELD_WIDTH }}
            title={field.label}
          >
            {field.label}
          </StyledHeaderCell>
        ))}
      </StyledHeaderRow>
      {swimlanes.map((swimlane) => {
        const totalDeviationDays = recordIndexRoadmapShowDeviation
          ? swimlane.records.reduce((acc, placed) => {
              const { deviationDays } = computeRoadmapDeviation({
                plannedEndDate: placed.plannedEndDate,
                actualEndDate: placed.endDate,
                status: placed.status,
                today,
              });
              return acc + deviationDays;
            }, 0)
          : 0;
        return (
          <StyledSwimlaneGroup key={swimlane.key}>
            <StyledSwimlaneHeader style={{ width: totalWidth }}>
              {swimlane.color !== undefined && swimlane.color !== null && (
                <StyledColorDot style={{ backgroundColor: swimlane.color }} />
              )}
              {swimlane.label}
              {recordIndexRoadmapShowDeviation && totalDeviationDays > 0 && (
                <StyledHeaderRightSlot>
                  <StyledDeviationBadge
                    title={`Cumulative slip across this group: ${totalDeviationDays} day${totalDeviationDays === 1 ? '' : 's'}`}
                  >
                    +{totalDeviationDays}d
                  </StyledDeviationBadge>
                </StyledHeaderRightSlot>
              )}
            </StyledSwimlaneHeader>
            {swimlane.records.map((placed) => (
              <StyledNameRow
                key={placed.record.id}
                onClick={() => onOpenRecord?.(placed.record.id)}
              >
                <StyledNameCell
                  title={placed.label}
                  style={{ width: ROADMAP_NAME_COLUMN_WIDTH }}
                >
                  {placed.label}
                </StyledNameCell>
                {extraFields.map((field) => (
                  <StyledFieldCell
                    key={field.id}
                    style={{ width: ROADMAP_NAME_COLUMN_FIELD_WIDTH }}
                  >
                    <FieldCell field={field} record={placed.record} />
                  </StyledFieldCell>
                ))}
              </StyledNameRow>
            ))}
          </StyledSwimlaneGroup>
        );
      })}
    </StyledColumn>
  );
};
