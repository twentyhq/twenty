import { useCallback, useEffect, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { enqueueSnackbar, useRecordId } from 'twenty-sdk/front-component';

import { MEETING_PICKER_FRONT_COMPONENT_UID } from 'src/constants/universal-identifiers';

// Inline styles only — Linaria/emotion break in the front-component sandbox
// (lesson #6). JSX restricted to div / span / input / button.
//
// Sandbox input handling: <input> onChange surfaces the value at
// `event.detail.value`, NOT `event.target.value`. The standard React pattern
// silently drops every keystroke. Same helper as attendees-editor.

const readInputValue = (e: unknown): string | null => {
  const detail = (e as { detail?: { value?: unknown } }).detail;
  if (typeof detail?.value === 'string') {
    return detail.value;
  }
  return null;
};

// ─── Styles ─────────────────────────────────────────────────────────────────

const containerStyle: React.CSSProperties = {
  background: '#ffffff',
  borderRadius: '8px',
  padding: '12px 14px',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
};

const labelStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  color: '#888',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const linkedRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '8px',
  background: '#eef2f7',
  borderRadius: '6px',
  padding: '8px 12px',
};

const linkedTitleStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#1f2937',
  fontWeight: 500,
};

const linkedMetaStyle: React.CSSProperties = {
  fontSize: '11.5px',
  color: '#6b7280',
};

const removeButtonStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: '#5f6368',
  fontSize: '14px',
  lineHeight: 1,
  padding: '0 6px',
  borderRadius: '50%',
};

const searchInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '6px 10px',
  fontSize: '13px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  outline: 'none',
  boxSizing: 'border-box',
};

const resultsContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  border: '1px solid #e5e7eb',
  borderRadius: '6px',
  overflow: 'hidden',
};

const resultRowStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  textAlign: 'left',
  padding: '8px 12px',
  fontSize: '13px',
  color: '#1f2937',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '2px',
};

const resultMetaStyle: React.CSSProperties = {
  fontSize: '11.5px',
  color: '#6b7280',
};

const hintStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#9ca3af',
  fontStyle: 'italic',
};

// ─── Types ──────────────────────────────────────────────────────────────────

type MeetingRow = {
  id: string;
  title: string;
  startsAt: string | null;
  endsAt: string | null;
  location: string | null;
};

// ─── GraphQL helpers (raw fetch — same pattern as attendees-editor) ─────────

const getApiConfig = () => {
  const baseUrl = process.env.TWENTY_API_URL ?? '';
  const apiUrl = baseUrl.endsWith('/graphql') ? baseUrl : `${baseUrl}/graphql`;
  const token =
    process.env.TWENTY_APP_ACCESS_TOKEN ?? process.env.TWENTY_API_KEY ?? '';
  return { apiUrl, token };
};

const graphqlFetch = async (
  query: string,
  variables: Record<string, unknown>,
): Promise<unknown> => {
  const { apiUrl, token } = getApiConfig();
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = (await response.json()) as {
    data?: unknown;
    errors?: { message: string }[];
  };
  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors[0].message);
  }
  return json.data;
};

// Format a meeting's date span for display: "13 May 2026, 14:30–15:30" or
// just the start if endsAt is missing or same-day-allday.
const formatDateRange = (
  startsAt: string | null,
  endsAt: string | null,
): string => {
  if (typeof startsAt !== 'string' || startsAt.length === 0) return '';
  const start = new Date(startsAt);
  if (Number.isNaN(start.getTime())) return '';

  const dateStr = start.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const startTime = start.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (typeof endsAt === 'string' && endsAt.length > 0) {
    const end = new Date(endsAt);
    if (!Number.isNaN(end.getTime())) {
      const endTime = end.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      });
      return `${dateStr}, ${startTime}–${endTime}`;
    }
  }

  return `${dateStr}, ${startTime}`;
};

const fetchCurrentMeeting = async (
  salesNoteId: string,
): Promise<MeetingRow | null> => {
  const data = (await graphqlFetch(
    `query CurrentMeeting($id: UUID!) {
       salesNotes(filter: { id: { eq: $id } }) {
         edges {
           node {
             id
             meeting {
               id
               title
               startsAt
               endsAt
               location
             }
           }
         }
       }
     }`,
    { id: salesNoteId },
  )) as {
    salesNotes?: {
      edges?:
        | {
            node?: {
              meeting?: {
                id?: string | null;
                title?: string | null;
                startsAt?: string | null;
                endsAt?: string | null;
                location?: string | null;
              } | null;
            } | null;
          }[]
        | null;
    } | null;
  };

  const meeting = data?.salesNotes?.edges?.[0]?.node?.meeting;
  if (
    meeting == null ||
    typeof meeting.id !== 'string' ||
    meeting.id.length === 0
  ) {
    return null;
  }

  return {
    id: meeting.id,
    title: meeting.title ?? '(untitled meeting)',
    startsAt: meeting.startsAt ?? null,
    endsAt: meeting.endsAt ?? null,
    location: meeting.location ?? null,
  };
};

const searchMeetings = async (
  query: string,
  excludeId: string | null,
): Promise<MeetingRow[]> => {
  const pattern = `%${query}%`;

  const data = (await graphqlFetch(
    `query MeetingSearch($q: String!) {
       calendarEvents(
         filter: { title: { ilike: $q } }
         orderBy: [{ startsAt: DescNullsLast }]
         first: 15
       ) {
         edges {
           node {
             id
             title
             startsAt
             endsAt
             location
           }
         }
       }
     }`,
    { q: pattern },
  )) as {
    calendarEvents?: {
      edges?:
        | {
            node?: {
              id?: string | null;
              title?: string | null;
              startsAt?: string | null;
              endsAt?: string | null;
              location?: string | null;
            } | null;
          }[]
        | null;
    } | null;
  };

  const out: MeetingRow[] = [];
  for (const edge of data?.calendarEvents?.edges ?? []) {
    const n = edge?.node;
    if (n == null || typeof n.id !== 'string') continue;
    if (excludeId != null && n.id === excludeId) continue;
    out.push({
      id: n.id,
      title: n.title ?? '(untitled meeting)',
      startsAt: n.startsAt ?? null,
      endsAt: n.endsAt ?? null,
      location: n.location ?? null,
    });
  }
  return out;
};

const linkMeeting = async (
  salesNoteId: string,
  meetingId: string | null,
): Promise<void> => {
  await graphqlFetch(
    `mutation LinkMeeting($id: UUID!, $meetingId: UUID) {
       updateSalesNote(id: $id, data: { meetingId: $meetingId }) { id }
     }`,
    { id: salesNoteId, meetingId },
  );
};

// ─── Component ──────────────────────────────────────────────────────────────

const MeetingPicker = () => {
  const salesNoteId = useRecordId();
  const [linkedMeeting, setLinkedMeeting] = useState<
    MeetingRow | null | undefined
  >(undefined);
  const [searchInput, setSearchInput] = useState('');
  const [searchHits, setSearchHits] = useState<MeetingRow[]>([]);
  const [isMutating, setIsMutating] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const reload = useCallback(async (): Promise<void> => {
    if (typeof salesNoteId !== 'string' || salesNoteId.length === 0) {
      setLinkedMeeting(null);
      return;
    }
    try {
      const row = await fetchCurrentMeeting(salesNoteId);
      setLinkedMeeting(row);
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load');
    }
  }, [salesNoteId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  // Debounced search — minimum 2 chars (meeting titles are often short),
  // 200ms debounce. Excludes the currently linked meeting from results.
  useEffect(() => {
    const q = searchInput.trim();
    if (q.length < 2) {
      setSearchHits([]);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      searchMeetings(q, linkedMeeting?.id ?? null)
        .then((hits) => {
          if (!cancelled) setSearchHits(hits);
        })
        .catch(() => {
          if (!cancelled) setSearchHits([]);
        });
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchInput, linkedMeeting]);

  const handleLink = async (hit: MeetingRow): Promise<void> => {
    if (
      isMutating ||
      typeof salesNoteId !== 'string' ||
      salesNoteId.length === 0
    ) {
      return;
    }
    setIsMutating(true);
    try {
      await linkMeeting(salesNoteId, hit.id);
      await reload();
      setSearchInput('');
      setSearchHits([]);
    } catch (err) {
      await enqueueSnackbar({
        message: err instanceof Error ? err.message : 'Failed to link meeting',
        variant: 'error',
      });
    }
    setIsMutating(false);
  };

  const handleUnlink = async (): Promise<void> => {
    if (
      isMutating ||
      typeof salesNoteId !== 'string' ||
      salesNoteId.length === 0
    ) {
      return;
    }
    setIsMutating(true);
    try {
      await linkMeeting(salesNoteId, null);
      await reload();
    } catch (err) {
      await enqueueSnackbar({
        message:
          err instanceof Error ? err.message : 'Failed to unlink meeting',
        variant: 'error',
      });
    }
    setIsMutating(false);
  };

  const trimmedQuery = searchInput.trim();
  const isLoadingMeeting = linkedMeeting === undefined && loadError == null;

  return (
    <div style={containerStyle}>
      <div style={labelStyle}>
        <span>Meeting</span>
      </div>

      {loadError != null ? (
        <span style={hintStyle}>Failed to load: {loadError}</span>
      ) : isLoadingMeeting ? (
        <span style={hintStyle}>Loading…</span>
      ) : linkedMeeting != null ? (
        <div style={linkedRowStyle}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={linkedTitleStyle}>{linkedMeeting.title}</span>
            {(() => {
              const dateStr = formatDateRange(
                linkedMeeting.startsAt,
                linkedMeeting.endsAt,
              );
              const loc = linkedMeeting.location ?? '';
              const meta = [dateStr, loc]
                .filter((s) => s.length > 0)
                .join(' · ');
              return meta.length > 0 ? (
                <span style={linkedMetaStyle}>{meta}</span>
              ) : null;
            })()}
          </div>
          <button
            style={removeButtonStyle}
            disabled={isMutating}
            onClick={handleUnlink}
            title="Unlink meeting"
          >
            ×
          </button>
        </div>
      ) : (
        <span style={hintStyle}>No meeting linked</span>
      )}

      <input
        style={searchInputStyle}
        type="text"
        value={searchInput}
        onChange={(e) => {
          const v = readInputValue(e);
          if (v !== null) setSearchInput(v);
        }}
        placeholder={
          linkedMeeting != null
            ? 'Search to replace the linked meeting…'
            : 'Search meetings (min 2 chars)…'
        }
        disabled={isMutating}
      />

      {trimmedQuery.length >= 2 && searchHits.length > 0 && (
        <div style={resultsContainerStyle}>
          {searchHits.map((hit) => {
            const dateStr = formatDateRange(hit.startsAt, hit.endsAt);
            const loc = hit.location ?? '';
            const meta = [dateStr, loc].filter((s) => s.length > 0).join(' · ');
            return (
              <button
                key={hit.id}
                style={resultRowStyle}
                disabled={isMutating}
                onClick={() => handleLink(hit)}
              >
                <span>{hit.title}</span>
                {meta.length > 0 && <span style={resultMetaStyle}>{meta}</span>}
              </button>
            );
          })}
        </div>
      )}

      {trimmedQuery.length >= 2 && searchHits.length === 0 && (
        <div style={hintStyle}>
          <span>No matching meetings found</span>
        </div>
      )}

      {trimmedQuery.length === 1 && (
        <div style={hintStyle}>
          <span>Type at least 2 characters to search</span>
        </div>
      )}
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: MEETING_PICKER_FRONT_COMPONENT_UID,
  name: 'meeting-picker',
  description:
    "Custom search-and-pick widget for the salesNote.meeting (calendarEvent) M2O relation. Twenty's standard relation picker excludes calendarEvent via OBJECTS_WITH_CHANNEL_VISIBILITY_CONSTRAINTS, so this bypasses the universal Search service and queries calendarEvents directly.",
  component: MeetingPicker,
});
