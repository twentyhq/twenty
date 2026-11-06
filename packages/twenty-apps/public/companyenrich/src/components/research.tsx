import { useState, type CSSProperties } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';
import { MainButton } from 'twenty-ui/components/input';
import { useTheme } from 'twenty-ui/theme';

import specification from 'src/schemas/operations.json';

const INPUT_STYLE: CSSProperties = {
  boxSizing: 'border-box',
  width: '100%',
  padding: 8,
  border: '1px solid #bbb',
  borderRadius: 4,
  background: 'transparent',
  color: 'inherit',
};

const RECORD_ACTIONS = [
  { name: 'enrich-company-record', label: 'Save company profile to CRM' },
  { name: 'enrich-person-record', label: 'Save person profile to CRM' },
];

type ResearchProps = { initialAction?: string; recordId?: string };

export const Research = ({
  initialAction = 'enrich-company',
  recordId,
}: ResearchProps = {}) => {
  const theme = useTheme();
  const [operationName, setOperationName] = useState(initialAction);
  const [domain, setDomain] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [body, setBody] = useState('{}');
  const [expand, setExpand] = useState(false);
  const [waitForEnrichment, setWaitForEnrichment] = useState(true);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const operation = specification.operations.find(
    (item) => item.name === operationName,
  );
  const properties = operation?.inputSchema.properties ?? {};
  const isRecordAction = operationName.endsWith('-record');
  const expansion =
    operationName.includes('person') || operationName.includes('people')
      ? 'education'
      : 'workforce';

  const chooseOperation = (name: string) => {
    setOperationName(name);
    const next = specification.operations.find((item) => item.name === name);
    setBody(JSON.stringify(next?.example.body ?? {}, null, 2));
    setExpand(false);
    setWaitForEnrichment(true);
    setResult('');
    setError('');
  };

  const run = async () => {
    setRunning(true);
    setError('');
    setResult('');
    try {
      const input: Record<string, unknown> = {};
      if (isRecordAction) input.recordId = (recordId ?? identifier).trim();
      if ('domain' in properties && domain.trim()) input.domain = domain.trim();
      if ('query' in properties) input.query = domain.trim();
      if ('id' in properties && identifier.trim()) input.id = identifier.trim();
      if ('body' in properties)
        input.body =
          operationName === 'lookup-person'
            ? { email: email.trim() }
            : JSON.parse(body);
      if ('expand' in properties && expand) input.expand = [expansion];
      if ('waitForEnrichment' in properties)
        input.waitForEnrichment = waitForEnrichment;

      const client = new RestApiClient();
      const response = await client.post<{ success: boolean; error?: string }>(
        `/s/companyenrich/${operationName}`,
        input,
      );
      if (response.success === false) {
        setError(response.error ?? 'CompanyEnrich request failed.');
      } else {
        setResult(JSON.stringify(response, null, 2));
      }
    } catch (caught) {
      setError(
        caught instanceof SyntaxError
          ? 'Enter a valid JSON request body.'
          : caught instanceof Error
            ? caught.message
            : 'CompanyEnrich request failed.',
      );
    } finally {
      setRunning(false);
    }
  };

  return (
    <div
      style={{
        padding: theme.spacing[4],
        color: theme.font.color.primary,
        background: theme.background.primary,
        fontFamily: 'inherit',
        display: 'grid',
        gap: 16,
      }}
    >
      <h2 style={{ margin: 0 }}>CompanyEnrich research</h2>
      <p style={{ margin: 0 }}>
        Research companies and professional profiles using your CompanyEnrich
        account.
      </p>
      <label>
        Action
        <select
          aria-label="Action"
          value={operationName}
          disabled={running}
          onChange={(event) => chooseOperation(event.target.value)}
          style={INPUT_STYLE}
        >
          {specification.operations.map((item) => (
            <option key={item.name} value={item.name}>
              {item.label}
            </option>
          ))}
          {RECORD_ACTIONS.map((item) => (
            <option key={item.name} value={item.name}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      {'domain' in properties && (
        <label>
          Company domain
          <input
            aria-label="Company domain"
            value={domain}
            onChange={(event) => setDomain(event.target.value)}
            placeholder="example.com"
            style={INPUT_STYLE}
          />
        </label>
      )}
      {'query' in properties && (
        <label>
          Partial company domain
          <input
            aria-label="Partial company domain"
            value={domain}
            onChange={(event) => setDomain(event.target.value)}
            placeholder="example"
            style={INPUT_STYLE}
          />
        </label>
      )}
      {('id' in properties || isRecordAction) && (
        <label>
          {isRecordAction ? 'Twenty record ID' : 'CompanyEnrich ID'}
          <input
            aria-label={
              isRecordAction ? 'Twenty record ID' : 'CompanyEnrich ID'
            }
            value={isRecordAction ? (recordId ?? identifier) : identifier}
            readOnly={isRecordAction && recordId !== undefined}
            onChange={(event) => setIdentifier(event.target.value)}
            style={INPUT_STYLE}
          />
        </label>
      )}
      {operationName === 'lookup-person' && (
        <label>
          Known email
          <input
            aria-label="Known email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            style={INPUT_STYLE}
          />
        </label>
      )}
      {'body' in properties && operationName !== 'lookup-person' && (
        <label>
          Request body (all API filters supported)
          <textarea
            aria-label="Request body"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={9}
            spellCheck={false}
            style={{ ...INPUT_STYLE, fontFamily: 'monospace' }}
          />
        </label>
      )}
      {'waitForEnrichment' in properties && (
        <label>
          <input
            type="checkbox"
            checked={waitForEnrichment}
            onChange={(event) => setWaitForEnrichment(event.target.checked)}
          />{' '}
          Wait for enrichment of new domains
        </label>
      )}
      {'expand' in properties && (
        <label>
          <input
            type="checkbox"
            checked={expand}
            onChange={(event) => setExpand(event.target.checked)}
          />{' '}
          Include {expansion} (additional CompanyEnrich credits)
        </label>
      )}
      <p style={{ margin: 0 }}>
        {isRecordAction
          ? 'Saves the full profile in dedicated CompanyEnrich fields. Existing CRM fields are preserved.'
          : 'Research results are returned here; CRM records are unchanged.'}{' '}
        Requests may consume CompanyEnrich credits. People search returns
        profiles, not email addresses.
      </p>
      <a
        href="https://docs.companyenrich.com/reference"
        target="_blank"
        rel="noreferrer"
      >
        Request fields and credit costs
      </a>
      <MainButton
        type="button"
        disabled={running}
        onClick={run}
        style={{ ...INPUT_STYLE, cursor: running ? 'wait' : 'pointer' }}
      >
        {running
          ? 'Running…'
          : isRecordAction
            ? 'Enrich and save profile'
            : 'Run research'}
      </MainButton>
      {error && <p role="alert">{error}</p>}
      {result && (
        <section aria-label="CompanyEnrich results">
          <h3>Results</h3>
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontSize: 12,
            }}
          >
            {result}
          </pre>
        </section>
      )}
    </div>
  );
};
