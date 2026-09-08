import { type EventRowDynamicComponentProps } from '@/activities/timeline-activities/rows/components/EventRowDynamicComponent.types';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { Fragment } from 'react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

type EventRowEnsoEventProps = EventRowDynamicComponentProps;

// Human-readable object-type tag shown just before each linked record, so a row
// reads "Person Maximilian … is another contact at Company Globex …". Keyed by
// the segment's objectNameSingular; unknown types render no tag.
const OBJECT_TYPE_LABELS: Record<string, string> = {
  person: 'Person',
  company: 'Company',
  opportunity: 'Deal',
  inboundActivity: 'Inbound activity',
  project: 'Project',
  workspaceMember: 'Manager',
};

// ENSO — renders `enso-event.<action>` automation events (company linking, B2B
// account-deal flow). The backend composes a plain-English sentence as an array
// of `properties.segments`: plain-text runs and clickable record links. We render
// them inline so it reads as a sentence, then append the actor:
//   properties.auto → "— by ENSO CRM", else "— by {author}".

type EnsoTimelineSegment =
  | { text: string }
  | { label: string; objectNameSingular: string; recordId: string };

const isLinkSegment = (
  segment: EnsoTimelineSegment,
): segment is {
  label: string;
  objectNameSingular: string;
  recordId: string;
} =>
  isNonEmptyString((segment as { recordId?: string }).recordId) &&
  isNonEmptyString(
    (segment as { objectNameSingular?: string }).objectNameSingular,
  );

const StyledRowContainer = styled.div`
  align-items: baseline;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  width: 100%;
`;

// flex: 1 + min-width: 0 lets a long sentence shrink and wrap to the next line
// instead of overflowing the timeline width; overflow-wrap breaks any single
// over-long token (e.g. a record label) rather than spilling past the edge.
// white-space: normal overrides the `white-space: nowrap` the shared timeline
// row container (EventRow) sets — without it the line can never break.
const StyledSentence = styled.div`
  color: ${themeCssVariables.font.color.primary};
  flex: 1;
  line-height: 1.5;
  min-width: 0;
  overflow-wrap: anywhere;
  white-space: normal;
`;

const StyledLink = styled.span`
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  font-weight: 500;
  text-decoration: underline;
`;

// Subtle, non-clickable type tag preceding a record link. Greyed + slightly
// smaller so it reads as a label, not part of the record name.
const StyledType = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  margin-right: ${themeCssVariables.spacing[1]};
`;

const StyledActor = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledDate = styled.div`
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: none;
  }
  color: ${themeCssVariables.font.color.tertiary};
  flex-shrink: 0;
  padding: 0 ${themeCssVariables.spacing[1]};
`;

export const EventRowEnsoEvent = ({
  authorFullName,
  event,
  createdAt,
}: EventRowEnsoEventProps) => {
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();

  const auto = event.properties?.auto === true;

  // Legacy fallback: events written before the segments format (no
  // properties.segments) get a simple text sentence from the old fields so
  // historical rows still read sensibly.
  const legacySegments = (): EnsoTimelineSegment[] => {
    const action = event.name.split('.')[1]?.replace(/-/g, ' ') ?? '';
    const cached = isNonEmptyString(event.linkedRecordCachedName)
      ? ` ${event.linkedRecordCachedName}`
      : '';
    const reason = isNonEmptyString(event.properties?.reason)
      ? ` · ${event.properties.reason}`
      : '';

    return [{ text: `${action}${cached}${reason}` }];
  };

  const segments: EnsoTimelineSegment[] = Array.isArray(
    event.properties?.segments,
  )
    ? event.properties.segments
    : legacySegments();

  return (
    <StyledRowContainer>
      <StyledSentence>
        {segments.map((segment, index) => {
          if (isLinkSegment(segment)) {
            // Skip the tag when the record name already starts with the type
            // word (e.g. a deal named "Deal | …" → no redundant "Deal" tag).
            const typeLabel = OBJECT_TYPE_LABELS[segment.objectNameSingular];
            const showType =
              isNonEmptyString(typeLabel) &&
              !segment.label.toLowerCase().startsWith(typeLabel.toLowerCase());

            return (
              <Fragment key={index}>
                {showType && <StyledType>{typeLabel}</StyledType>}
                <StyledLink
                  onClick={() =>
                    openRecordInSidePanel({
                      recordId: segment.recordId,
                      objectNameSingular: segment.objectNameSingular,
                    })
                  }
                >
                  {segment.label}
                </StyledLink>
              </Fragment>
            );
          }

          return <span key={index}>{(segment as { text: string }).text}</span>;
        })}
        <StyledActor>
          {auto ? t` — by ENSO CRM` : t` — by ${authorFullName}`}
        </StyledActor>
      </StyledSentence>
      <StyledDate>{createdAt}</StyledDate>
    </StyledRowContainer>
  );
};
