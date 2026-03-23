import { useEffect, useState } from 'react';
import { defineFrontComponent, useRecordId } from 'twenty-sdk';

import { MATCH_RESULT_DIFF_VIEWER_FRONT_COMPONENT_ID } from 'src/constants/universal-identifiers';

type FieldDiff = {
  field: string;
  label: string;
  category: string;
  bobValue: string | null;
  crmValue: string | null;
  action: 'UPDATE' | 'COMPUTED' | 'INFO_ONLY';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  approval: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SKIPPED';
  crmField: string | null;
  crmObjectType: 'policy' | 'lead' | null;
  note: string | null;
};

type FallbackRow = {
  label: string;
  category: string;
  bobValue: string | null;
  crmValue: string | null;
};

const FALLBACK_FIELD_MAP: {
  field: string;
  label: string;
  category: string;
  bobKey: string;
  crmKey: string;
}[] = [
  { field: 'status', label: 'Derived Status', category: 'Status', bobKey: '_derivedStatus', crmKey: '_currentCrmStatus' },
  { field: 'memberFirstName', label: 'First Name', category: 'Identity', bobKey: 'memberFirstName', crmKey: '_leadFirstName' },
  { field: 'memberLastName', label: 'Last Name', category: 'Identity', bobKey: 'memberLastName', crmKey: '_leadLastName' },
  { field: 'memberDob', label: 'Date of Birth', category: 'Identity', bobKey: 'memberDob', crmKey: '_leadDob' },
  { field: 'brokerName', label: 'Agent Name', category: 'Agent', bobKey: 'brokerName', crmKey: '_agentName' },
  { field: 'brokerNpn', label: 'Agent NPN', category: 'Agent', bobKey: 'brokerNpn', crmKey: '_agentNpn' },
  { field: 'effectiveDate', label: 'Effective Date', category: 'Dates', bobKey: 'trueEffectiveDate', crmKey: '_effectiveDate' },
  { field: 'policyNumber', label: 'Policy Number', category: 'Policy', bobKey: 'carrierPolicyNumber', crmKey: '_policyNumber' },
  { field: 'planName', label: 'Plan Name', category: 'Policy', bobKey: 'planName', crmKey: '_planIdentifier' },
  { field: 'memberPhone', label: 'Phone', category: 'Policy', bobKey: 'memberPhone', crmKey: '_leadPhone' },
  { field: 'memberEmail', label: 'Email', category: 'Policy', bobKey: 'memberEmail', crmKey: '_leadEmail' },
];

const getApiConfig = () => {
  const proc = (globalThis as Record<string, unknown>)['process'] as
    | { env?: Record<string, string> }
    | undefined;

  return {
    apiUrl: proc?.env?.['TWENTY_API_URL'] ?? '',
    token: proc?.env?.['TWENTY_APP_ACCESS_TOKEN'] ?? '',
  };
};

const SEVERITY_COLORS: Record<string, { bg: string; border: string }> = {
  CRITICAL: { bg: '#fef3f2', border: '#fecdca' },
  WARNING: { bg: '#fffaeb', border: '#fedf89' },
  INFO: { bg: '#f9fafb', border: '#e4e7ec' },
};

const styles = {
  container: {
    padding: '16px',
    fontFamily: 'Inter, sans-serif',
    fontSize: '13px',
  } as const,
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  } as const,
  title: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
  } as const,
  buttonRow: {
    display: 'flex',
    gap: '8px',
  } as const,
  button: {
    padding: '6px 14px',
    fontSize: '13px',
    fontWeight: '500',
    border: '1px solid #d0d5dd',
    borderRadius: '6px',
    background: '#fff',
    color: '#344054',
    cursor: 'pointer',
  } as const,
  buttonPrimary: {
    padding: '6px 14px',
    fontSize: '13px',
    fontWeight: '500',
    border: '1px solid #175cd3',
    borderRadius: '6px',
    background: '#175cd3',
    color: '#fff',
    cursor: 'pointer',
  } as const,
  buttonDisabled: {
    padding: '6px 14px',
    fontSize: '13px',
    fontWeight: '500',
    border: '1px solid #e4e7ec',
    borderRadius: '6px',
    background: '#f9fafb',
    color: '#98a2b3',
    cursor: 'not-allowed',
  } as const,
  categoryHeader: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#667085',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    padding: '8px 0 4px',
    borderBottom: '1px solid #e4e7ec',
    marginTop: '12px',
  } as const,
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    marginBottom: '4px',
  } as const,
  th: {
    padding: '6px 10px',
    fontSize: '11px',
    fontWeight: '600',
    color: '#667085',
    textAlign: 'left' as const,
    borderBottom: '1px solid #e4e7ec',
  } as const,
  td: {
    padding: '8px 10px',
    fontSize: '13px',
    borderBottom: '1px solid #f2f4f7',
    verticalAlign: 'middle' as const,
  } as const,
  strikethrough: {
    textDecoration: 'line-through',
    color: '#98a2b3',
  } as const,
  approveBtn: {
    padding: '2px 8px',
    fontSize: '12px',
    border: '1px solid #abefc6',
    borderRadius: '4px',
    background: '#ecfdf3',
    color: '#067647',
    cursor: 'pointer',
    marginRight: '4px',
  } as const,
  rejectBtn: {
    padding: '2px 8px',
    fontSize: '12px',
    border: '1px solid #fecdca',
    borderRadius: '4px',
    background: '#fef3f2',
    color: '#b42318',
    cursor: 'pointer',
  } as const,
  approvedBadge: {
    padding: '2px 8px',
    fontSize: '11px',
    borderRadius: '4px',
    background: '#ecfdf3',
    color: '#067647',
    fontWeight: '500',
  } as const,
  rejectedBadge: {
    padding: '2px 8px',
    fontSize: '11px',
    borderRadius: '4px',
    background: '#fef3f2',
    color: '#b42318',
    fontWeight: '500',
  } as const,
  matchBadge: {
    padding: '2px 8px',
    fontSize: '11px',
    borderRadius: '4px',
    background: '#ecfdf3',
    color: '#067647',
    fontWeight: '500',
  } as const,
  infoToggle: {
    marginTop: '12px',
    fontSize: '12px',
    color: '#667085',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  } as const,
  toast: {
    padding: '8px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    marginTop: '12px',
  } as const,
  empty: {
    padding: '24px',
    textAlign: 'center' as const,
    color: '#667085',
    fontSize: '13px',
  } as const,
  note: {
    fontSize: '11px',
    color: '#667085',
    fontStyle: 'italic' as const,
    marginTop: '2px',
  } as const,
};

const gqlFetch = async (apiUrl: string, token: string, query: string, variables: Record<string, unknown>) => {
  const response = await fetch(`${apiUrl}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });

  return response.json();
};

const buildFallbackRows = (
  bobRow: Record<string, unknown> | null,
  crmPolicy: Record<string, unknown> | null,
  matchResult: Record<string, unknown>,
): FallbackRow[] => {
  const rows: FallbackRow[] = [];

  // Build a merged lookup: BOB fields from the normalized book row,
  // CRM fields from the policy (prefixed with _ to avoid collision)
  const vals: Record<string, string | null> = {};

  if (bobRow) {
    for (const [k, v] of Object.entries(bobRow)) {
      vals[k] = v != null ? String(v) : null;
    }
  }

  if (crmPolicy) {
    vals['_policyNumber'] = crmPolicy['policyNumber'] != null ? String(crmPolicy['policyNumber']) : null;
    vals['_effectiveDate'] = crmPolicy['effectiveDate'] != null ? String(crmPolicy['effectiveDate']) : null;
    vals['_planIdentifier'] = crmPolicy['planIdentifier'] != null ? String(crmPolicy['planIdentifier']) : null;
    vals['_currentCrmStatus'] = crmPolicy['status'] != null ? String(crmPolicy['status']) : null;

    const lead = crmPolicy['lead'] as Record<string, unknown> | null;

    if (lead) {
      const name = lead['name'] as Record<string, unknown> | null;

      vals['_leadFirstName'] = name?.['firstName'] != null ? String(name['firstName']) : null;
      vals['_leadLastName'] = name?.['lastName'] != null ? String(name['lastName']) : null;
      vals['_leadDob'] = lead['dateOfBirth'] != null ? String(lead['dateOfBirth']) : null;

      const phones = lead['phones'] as Record<string, unknown> | null;

      vals['_leadPhone'] = phones?.['primaryPhoneNumber'] != null ? String(phones['primaryPhoneNumber']) : null;

      const emails = lead['emails'] as Record<string, unknown> | null;

      vals['_leadEmail'] = emails?.['primaryEmail'] != null ? String(emails['primaryEmail']) : null;
    }

    const agent = crmPolicy['agent'] as Record<string, unknown> | null;

    if (agent) {
      vals['_agentName'] = agent['name'] != null ? String(agent['name']) : null;
      vals['_agentNpn'] = agent['npn'] != null ? String(agent['npn']) : null;
    }
  }

  // Use match result's derived/current fields for status row
  vals['_derivedStatus'] = matchResult['derivedStatus'] != null ? String(matchResult['derivedStatus']) : null;
  vals['_currentCrmStatus'] = matchResult['currentCrmStatus'] != null
    ? String(matchResult['currentCrmStatus'])
    : vals['_currentCrmStatus'] ?? null;

  for (const mapping of FALLBACK_FIELD_MAP) {
    const bobValue = vals[mapping.bobKey] ?? null;
    const crmValue = vals[mapping.crmKey] ?? null;

    // Show all rows where at least one side has data
    if (bobValue != null || crmValue != null) {
      rows.push({
        label: mapping.label,
        category: mapping.category,
        bobValue,
        crmValue,
      });
    }
  }

  return rows;
};

const MatchResultDiffViewer = () => {
  const recordId = useRecordId();
  const [diffs, setDiffs] = useState<FieldDiff[]>([]);
  const [fallbackRows, setFallbackRows] = useState<FallbackRow[]>([]);
  const [isFallback, setIsFallback] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    success: boolean;
  } | null>(null);
  const [showInfoOnly, setShowInfoOnly] = useState(false);

  useEffect(() => {
    if (!recordId) return;

    const fetchData = async () => {
      const { apiUrl, token } = getApiConfig();

      try {
        // Fetch match result with fieldDiffs + related IDs for fallback
        const json = await gqlFetch(apiUrl, token,
          `query GetMatchResultDiffs($id: UUID!) {
            payReconMatchResult(id: $id) {
              fieldDiffs
              matchStatus
              crmPolicyId
              derivedStatus
              currentCrmStatus
              derivedExpireDate
              currentCrmExpireDate
              normalizedBookRow {
                carrierPolicyNumber
                memberFirstName
                memberLastName
                memberDob
                brokerName
                brokerNpn
                trueEffectiveDate
                planName
                memberPhone
                memberEmail
              }
            }
          }`,
          { id: recordId },
        );

        const mr = json?.data?.payReconMatchResult;

        if (!mr) {
          setLoading(false);

          return;
        }

        // If fieldDiffs is populated, use it directly
        if (mr.fieldDiffs) {
          const parsed =
            typeof mr.fieldDiffs === 'string'
              ? JSON.parse(mr.fieldDiffs)
              : mr.fieldDiffs;

          if (Array.isArray(parsed) && parsed.length > 0) {
            setDiffs(parsed);
            setLoading(false);

            return;
          }
        }

        // Fallback: fetch CRM policy and build comparison rows
        let crmPolicy: Record<string, unknown> | null = null;

        if (mr.crmPolicyId) {
          const policyJson = await gqlFetch(apiUrl, token,
            `query GetPolicyForDiff($id: UUID!) {
              policy(id: $id) {
                policyNumber effectiveDate expirationDate status planIdentifier
                lead { name { firstName lastName } dateOfBirth phones { primaryPhoneNumber } emails { primaryEmail } }
                agent { name npn }
              }
            }`,
            { id: mr.crmPolicyId },
          );

          crmPolicy = policyJson?.data?.policy ?? null;
        }

        const rows = buildFallbackRows(mr.normalizedBookRow, crmPolicy, mr);

        setFallbackRows(rows);
        setIsFallback(true);
      } catch {
        // Silently handle errors
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [recordId]);

  if (!recordId) {
    return (
      <div style={styles.container}>
        <p>No record context available.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <p style={{ color: '#667085' }}>Loading diffs...</p>
      </div>
    );
  }

  // --- Fallback: read-only comparison table ---
  if (isFallback) {
    if (fallbackRows.length === 0) {
      return (
        <div style={styles.container}>
          <div style={styles.empty}>No BOB or CRM data available for comparison.</div>
        </div>
      );
    }

    // Group by category
    const fallbackCategories = new Map<string, FallbackRow[]>();

    for (const row of fallbackRows) {
      const group = fallbackCategories.get(row.category) ?? [];

      group.push(row);
      fallbackCategories.set(row.category, group);
    }

    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <p style={styles.title}>BOB vs CRM Comparison</p>
          <span style={{ fontSize: '11px', color: '#98a2b3' }}>
            Read-only — re-run matching to enable approval
          </span>
        </div>

        {Array.from(fallbackCategories.entries()).map(([category, rows]) => (
          <div key={category}>
            <div style={styles.categoryHeader}>{category}</div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={{ ...styles.th, width: '25%' }}>Field</th>
                  <th style={{ ...styles.th, width: '37%' }}>BOB Value</th>
                  <th style={{ ...styles.th, width: '37%' }}>CRM Value</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const matches =
                    row.bobValue != null &&
                    row.crmValue != null &&
                    row.bobValue.trim().toLowerCase() === row.crmValue.trim().toLowerCase();
                  const hasDiff =
                    row.bobValue != null &&
                    row.crmValue != null &&
                    !matches;

                  return (
                    <tr
                      key={row.label}
                      style={{
                        backgroundColor: hasDiff ? '#fffaeb' : undefined,
                      }}
                    >
                      <td style={styles.td}>
                        <strong>{row.label}</strong>
                      </td>
                      <td style={styles.td}>{row.bobValue ?? '—'}</td>
                      <td style={styles.td}>
                        {row.crmValue ?? '—'}
                        {matches && (
                          <span style={{ ...styles.matchBadge, marginLeft: '8px' }}>
                            Match
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    );
  }

  // --- Primary: fieldDiffs-driven approval UI ---
  if (diffs.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.empty}>No field differences detected.</div>
      </div>
    );
  }

  const actionableDiffs = diffs.filter((d) => d.action !== 'INFO_ONLY');
  const infoDiffs = diffs.filter((d) => d.action === 'INFO_ONLY');

  const setApproval = (index: number, approval: FieldDiff['approval']) => {
    setDiffs((prev) => {
      const next = [...prev];

      next[index] = { ...next[index], approval };

      return next;
    });
  };

  const approveAll = () => {
    setDiffs((prev) =>
      prev.map((d) =>
        d.action !== 'INFO_ONLY' ? { ...d, approval: 'APPROVED' } : d,
      ),
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setToast(null);

    const { apiUrl, token } = getApiConfig();

    try {
      const response = await fetch(`${apiUrl}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          query: `mutation UpdateMatchResultDiffs($id: UUID!, $data: PayReconMatchResultUpdateInput!) {
            updatePayReconMatchResult(id: $id, data: $data) { id }
          }`,
          variables: {
            id: recordId,
            data: {
              fieldDiffs: diffs,
              matchStatus: 'CONFIRMED',
              writeBackStatus: 'PENDING',
            },
          },
        }),
      });

      const json = await response.json();

      if (json?.errors?.length) {
        throw new Error(json.errors[0].message);
      }

      setToast({ message: 'Diffs saved and queued for write-back.', success: true });
    } catch (error) {
      setToast({
        message: `Save failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false,
      });
    } finally {
      setSaving(false);
    }
  };

  // Group diffs by category
  const categories = new Map<string, { diffs: FieldDiff[]; indices: number[] }>();

  for (let i = 0; i < diffs.length; i++) {
    const d = diffs[i];

    if (d.action === 'INFO_ONLY' && !showInfoOnly) continue;

    const group = categories.get(d.category) ?? { diffs: [], indices: [] };

    group.diffs.push(d);
    group.indices.push(i);
    categories.set(d.category, group);
  }

  const hasApprovedDiffs = actionableDiffs.some(
    (d) => d.approval === 'APPROVED',
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <p style={styles.title}>BOB vs CRM Diff</p>
        <div style={styles.buttonRow}>
          <button
            style={styles.button}
            onClick={approveAll}
            disabled={actionableDiffs.length === 0}
          >
            Approve All
          </button>
          <button
            style={
              saving || !hasApprovedDiffs
                ? styles.buttonDisabled
                : styles.buttonPrimary
            }
            onClick={handleSave}
            disabled={saving || !hasApprovedDiffs}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {Array.from(categories.entries()).map(([category, group]) => (
        <div key={category}>
          <div style={styles.categoryHeader}>{category}</div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.th, width: '20%' }}>Field</th>
                <th style={{ ...styles.th, width: '28%' }}>BOB Value</th>
                <th style={{ ...styles.th, width: '28%' }}>CRM Value</th>
                <th style={{ ...styles.th, width: '24%' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {group.diffs.map((diff, localIdx) => {
                const globalIdx = group.indices[localIdx];
                const severityColor = SEVERITY_COLORS[diff.severity] ?? SEVERITY_COLORS.INFO;

                return (
                  <tr
                    key={diff.field}
                    style={{
                      backgroundColor: severityColor.bg,
                    }}
                  >
                    <td style={styles.td}>
                      <strong>{diff.label}</strong>
                      {diff.note && <div style={styles.note}>{diff.note}</div>}
                    </td>
                    <td style={styles.td}>
                      {diff.approval === 'REJECTED' ? (
                        <span style={styles.strikethrough}>
                          {diff.bobValue ?? '—'}
                        </span>
                      ) : (
                        diff.bobValue ?? '—'
                      )}
                    </td>
                    <td style={styles.td}>
                      {diff.approval === 'APPROVED' ? (
                        <span style={styles.strikethrough}>
                          {diff.crmValue ?? '—'}
                        </span>
                      ) : (
                        diff.crmValue ?? '—'
                      )}
                    </td>
                    <td style={styles.td}>
                      {diff.action === 'INFO_ONLY' ? (
                        <span
                          style={{
                            fontSize: '11px',
                            color: '#667085',
                          }}
                        >
                          Info only
                        </span>
                      ) : diff.approval === 'APPROVED' ? (
                        <span style={styles.approvedBadge}>Approved</span>
                      ) : diff.approval === 'REJECTED' ? (
                        <span style={styles.rejectedBadge}>Rejected</span>
                      ) : (
                        <>
                          <button
                            style={styles.approveBtn}
                            onClick={() => setApproval(globalIdx, 'APPROVED')}
                          >
                            &#10003;
                          </button>
                          <button
                            style={styles.rejectBtn}
                            onClick={() => setApproval(globalIdx, 'REJECTED')}
                          >
                            &#10007;
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}

      {infoDiffs.length > 0 && !showInfoOnly && (
        <div
          style={styles.infoToggle}
          onClick={() => setShowInfoOnly(true)}
        >
          &#9432; {infoDiffs.length} info-only field(s) (Agent, Plan, etc.)
          &nbsp;[show]
        </div>
      )}

      {showInfoOnly && infoDiffs.length > 0 && (
        <div
          style={styles.infoToggle}
          onClick={() => setShowInfoOnly(false)}
        >
          [hide info-only fields]
        </div>
      )}

      {toast && (
        <div
          style={{
            ...styles.toast,
            background: toast.success ? '#ecfdf3' : '#fef3f2',
            color: toast.success ? '#067647' : '#b42318',
            border: `1px solid ${toast.success ? '#abefc6' : '#fecdca'}`,
          }}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: MATCH_RESULT_DIFF_VIEWER_FRONT_COMPONENT_ID,
  name: 'match-result-diff-viewer',
  description:
    'Side-by-side BOB vs CRM field diff viewer with per-field approval for write-back',
  component: MatchResultDiffViewer,
});
