import { useCallback, useEffect, useMemo, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  enqueueSnackbar,
  useRecordId,
} from 'twenty-sdk/front-component';

import { ATTENDEES_EDITOR_FRONT_COMPONENT_UID } from 'src/constants/universal-identifiers';

// Inline styles only — Linaria/emotion break in the front-component sandbox
// (lesson #6). JSX restricted to div / span / input / button.

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

const chipsRowStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '6px',
  minHeight: '24px',
};

const chipStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  background: '#eef2f7',
  borderRadius: '14px',
  padding: '3px 6px 3px 10px',
  fontSize: '12.5px',
  color: '#1f2937',
};

const chipRemoveButtonStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: '#5f6368',
  fontSize: '14px',
  lineHeight: 1,
  padding: '0 4px',
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

const resultEmailStyle: React.CSSProperties = {
  fontSize: '11.5px',
  color: '#6b7280',
};

const hintStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#9ca3af',
  fontStyle: 'italic',
};

// ─── Types ──────────────────────────────────────────────────────────────────

type AttendeeRow = {
  attendeeRecordId: string; // salesNoteAttendee.id, used to delete the link
  personId: string;
  personDisplayName: string;
  personEmail: string | null;
};

type PersonHit = {
  id: string;
  displayName: string;
  email: string | null;
};

// ─── GraphQL helpers (raw fetch — CoreApiClient sandbox issue, lesson #2) ───

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

const personDisplay = (
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  email: string | null | undefined,
): string => {
  const combined = `${firstName ?? ''} ${lastName ?? ''}`.trim();
  if (combined.length > 0) return combined;
  if (typeof email === 'string' && email.length > 0) return email;
  return '(unnamed)';
};

const fetchCurrentAttendees = async (
  salesNoteId: string,
): Promise<AttendeeRow[]> => {
  const data = (await graphqlFetch(
    `query CurrentAttendees($id: UUID!) {
       salesNoteAttendees(filter: { salesNoteId: { eq: $id } }) {
         edges {
           node {
             id
             personId
             person {
               id
               name { firstName lastName }
               emails { primaryEmail }
             }
           }
         }
       }
     }`,
    { id: salesNoteId },
  )) as {
    salesNoteAttendees?: {
      edges?: {
        node?: {
          id?: string | null;
          personId?: string | null;
          person?: {
            id?: string | null;
            name?: {
              firstName?: string | null;
              lastName?: string | null;
            } | null;
            emails?: { primaryEmail?: string | null } | null;
          } | null;
        } | null;
      }[] | null;
    } | null;
  };

  const out: AttendeeRow[] = [];
  for (const edge of data?.salesNoteAttendees?.edges ?? []) {
    const n = edge?.node;
    if (
      n == null ||
      typeof n.id !== 'string' ||
      typeof n.personId !== 'string'
    ) {
      continue;
    }
    const email = n.person?.emails?.primaryEmail ?? null;
    out.push({
      attendeeRecordId: n.id,
      personId: n.personId,
      personDisplayName: personDisplay(
        n.person?.name?.firstName,
        n.person?.name?.lastName,
        email,
      ),
      personEmail: email,
    });
  }

  // Stable alphabetical order so chips don't shuffle on refresh.
  out.sort((a, b) =>
    a.personDisplayName.localeCompare(b.personDisplayName, undefined, {
      sensitivity: 'base',
    }),
  );
  return out;
};

const searchPeople = async (
  query: string,
  excludePersonIds: Set<string>,
): Promise<PersonHit[]> => {
  // SQL ilike pattern needs the wildcards baked in.
  const pattern = `%${query}%`;

  const data = (await graphqlFetch(
    `query PersonSearch($q: String!) {
       people(
         filter: {
           or: [
             { name: { firstName: { ilike: $q } } },
             { name: { lastName: { ilike: $q } } },
             { emails: { primaryEmail: { ilike: $q } } }
           ]
         }
         first: 10
       ) {
         edges {
           node {
             id
             name { firstName lastName }
             emails { primaryEmail }
           }
         }
       }
     }`,
    { q: pattern },
  )) as {
    people?: {
      edges?: {
        node?: {
          id?: string | null;
          name?: {
            firstName?: string | null;
            lastName?: string | null;
          } | null;
          emails?: { primaryEmail?: string | null } | null;
        } | null;
      }[] | null;
    } | null;
  };

  const out: PersonHit[] = [];
  for (const edge of data?.people?.edges ?? []) {
    const n = edge?.node;
    if (n == null || typeof n.id !== 'string') continue;
    if (excludePersonIds.has(n.id)) continue;
    const email = n.emails?.primaryEmail ?? null;
    out.push({
      id: n.id,
      displayName: personDisplay(
        n.name?.firstName,
        n.name?.lastName,
        email,
      ),
      email,
    });
  }
  return out;
};

const createAttendee = async (
  salesNoteId: string,
  person: PersonHit,
): Promise<void> => {
  await graphqlFetch(
    `mutation CreateAttendee($data: SalesNoteAttendeeCreateInput!) {
       createSalesNoteAttendee(data: $data) { id }
     }`,
    {
      data: {
        salesNoteId,
        personId: person.id,
        // Cached display label — same shape we use in the auto-attendee
        // logic function. Junction's labelIdentifier is `name`.
        name: person.displayName,
      },
    },
  );
};

const deleteAttendee = async (attendeeRecordId: string): Promise<void> => {
  await graphqlFetch(
    `mutation DeleteAttendee($id: UUID!) {
       deleteSalesNoteAttendee(id: $id) { id }
     }`,
    { id: attendeeRecordId },
  );
};

// ─── Component ──────────────────────────────────────────────────────────────

const AttendeesEditor = () => {
  const salesNoteId = useRecordId();
  const [attendees, setAttendees] = useState<AttendeeRow[] | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchHits, setSearchHits] = useState<PersonHit[]>([]);
  const [isMutating, setIsMutating] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const reload = useCallback(async (): Promise<void> => {
    if (typeof salesNoteId !== 'string' || salesNoteId.length === 0) {
      setAttendees([]);
      return;
    }
    try {
      const rows = await fetchCurrentAttendees(salesNoteId);
      setAttendees(rows);
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load');
    }
  }, [salesNoteId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  // Debounced search — minimum 3 chars, 200ms debounce. Excludes the people
  // already linked to the current sales note so the dropdown doesn't suggest
  // duplicates.
  const excludePersonIds = useMemo(
    () => new Set((attendees ?? []).map((a) => a.personId)),
    [attendees],
  );

  useEffect(() => {
    const q = searchInput.trim();
    if (q.length < 3) {
      setSearchHits([]);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      searchPeople(q, excludePersonIds)
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
  }, [searchInput, excludePersonIds]);

  const handleAdd = async (hit: PersonHit): Promise<void> => {
    if (
      isMutating ||
      typeof salesNoteId !== 'string' ||
      salesNoteId.length === 0
    ) {
      return;
    }
    setIsMutating(true);
    try {
      await createAttendee(salesNoteId, hit);
      await reload();
      setSearchInput('');
      setSearchHits([]);
    } catch (err) {
      await enqueueSnackbar({
        message:
          err instanceof Error ? err.message : 'Failed to add attendee',
        variant: 'error',
      });
    }
    setIsMutating(false);
  };

  const handleRemove = async (row: AttendeeRow): Promise<void> => {
    if (isMutating) return;
    setIsMutating(true);
    try {
      await deleteAttendee(row.attendeeRecordId);
      await reload();
    } catch (err) {
      await enqueueSnackbar({
        message:
          err instanceof Error ? err.message : 'Failed to remove attendee',
        variant: 'error',
      });
    }
    setIsMutating(false);
  };

  if (loadError != null) {
    return (
      <div style={containerStyle}>
        <div style={labelStyle}>
          <span>Attendees</span>
        </div>
        <div style={hintStyle}>
          <span>Failed to load: {loadError}</span>
        </div>
      </div>
    );
  }

  if (attendees == null) {
    return (
      <div style={containerStyle}>
        <div style={labelStyle}>
          <span>Attendees</span>
        </div>
        <div style={hintStyle}>
          <span>Loading…</span>
        </div>
      </div>
    );
  }

  const trimmedQuery = searchInput.trim();

  return (
    <div style={containerStyle}>
      <div style={labelStyle}>
        <span>Attendees</span>
      </div>

      <div style={chipsRowStyle}>
        {attendees.length === 0 ? (
          <span style={hintStyle}>No attendees yet</span>
        ) : (
          attendees.map((row) => (
            <span key={row.attendeeRecordId} style={chipStyle}>
              <span>{row.personDisplayName}</span>
              <button
                style={chipRemoveButtonStyle}
                disabled={isMutating}
                onClick={() => handleRemove(row)}
                title={`Remove ${row.personDisplayName}`}
              >
                ×
              </button>
            </span>
          ))
        )}
      </div>

      <input
        style={searchInputStyle}
        type="text"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder="Search People to add (min 3 chars)…"
        disabled={isMutating}
      />

      {trimmedQuery.length >= 3 && searchHits.length > 0 && (
        <div style={resultsContainerStyle}>
          {searchHits.map((hit) => (
            <button
              key={hit.id}
              style={resultRowStyle}
              disabled={isMutating}
              onClick={() => handleAdd(hit)}
            >
              <span>{hit.displayName}</span>
              {hit.email != null && hit.email.length > 0 && (
                <span style={resultEmailStyle}>{hit.email}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {trimmedQuery.length >= 3 && searchHits.length === 0 && (
        <div style={hintStyle}>
          <span>No matching People found</span>
        </div>
      )}

      {trimmedQuery.length > 0 && trimmedQuery.length < 3 && (
        <div style={hintStyle}>
          <span>Type at least 3 characters to search</span>
        </div>
      )}
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: ATTENDEES_EDITOR_FRONT_COMPONENT_UID,
  name: 'attendees-editor',
  description:
    'Inline editor for the salesNote.attendees M2M relation. Renders linked Persons as removable chips and exposes a real Person picker (search by name or email).',
  component: AttendeesEditor,
});
