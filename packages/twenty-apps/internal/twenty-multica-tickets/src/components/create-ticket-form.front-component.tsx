import { useCallback, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';

import { CREATE_TICKET_FORM_COMPONENT_ID } from 'src/constants/universal-identifiers';

type CreateTicketResult = {
  success?: boolean;
  error?: string;
  issue?: { identifier?: string };
};

type PriorityOption = {
  value: string;
  label: string;
};

const PRIORITY_OPTIONS: PriorityOption[] = [
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const callAppRoute = async (
  path: string,
  method: string,
  body?: Record<string, unknown>,
): Promise<Record<string, unknown>> => {
  const response = await fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });
  return response.json() as Promise<Record<string, unknown>>;
};

const CreateTicketForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<CreateTicketResult | null>(null);

  const handleSubmit = useCallback(async () => {
    if (!title.trim()) {
      return;
    }

    setSubmitting(true);
    setResult(null);

    try {
      const body: Record<string, unknown> = {
        title: title.trim(),
        priority,
      };
      if (description.trim()) {
        body.description = description.trim();
      }
      if (dueDate) {
        body.dueDate = dueDate;
      }

      const data = (await callAppRoute(
        '/s/multica/issues',
        'POST',
        body,
      )) as CreateTicketResult;

      setResult(data);

      if (data.success) {
        setTitle('');
        setDescription('');
        setPriority('medium');
        setDueDate('');
      }
    } catch {
      setResult({ success: false, error: 'Network error — try again.' });
    } finally {
      setSubmitting(false);
    }
  }, [title, description, priority, dueDate]);

  return (
    <div
      style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
        Create Support Ticket
      </h3>

      <div>
        <label
          style={{
            display: 'block',
            marginBottom: '4px',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          Title *
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Brief summary of the issue"
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '6px',
            border: '1px solid #d0d5dd',
            fontSize: '14px',
          }}
        />
      </div>

      <div>
        <label
          style={{
            display: 'block',
            marginBottom: '4px',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Details, steps to reproduce, context..."
          rows={4}
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '6px',
            border: '1px solid #d0d5dd',
            fontSize: '14px',
            resize: 'vertical',
          }}
        />
      </div>

      <div>
        <label
          style={{
            display: 'block',
            marginBottom: '4px',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          Priority
        </label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '6px',
            border: '1px solid #d0d5dd',
            fontSize: '14px',
          }}
        >
          {PRIORITY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 500 }}>Due date</label>
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d0d5dd', fontSize: '14px' }} />
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting || !title.trim()}
        style={{
          padding: '10px 16px',
          borderRadius: '6px',
          border: 'none',
          background: submitting ? '#a0aec0' : '#1a56db',
          color: 'white',
          fontSize: '14px',
          fontWeight: 500,
          cursor: submitting ? 'not-allowed' : 'pointer',
        }}
      >
        {submitting ? 'Creating...' : 'Create Ticket'}
      </button>

      {result && (
        <div
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '13px',
            background: result.success ? '#def7ec' : '#fde8e8',
            color: result.success ? '#03543f' : '#9b1c1c',
          }}
        >
          {result.success
            ? `Created ${result.issue?.identifier ?? 'ticket'}`
            : result.error}
        </div>
      )}
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: CREATE_TICKET_FORM_COMPONENT_ID,
  name: 'create-ticket-form',
  label: 'Create Support Ticket',
  description: 'Quick form to create a support ticket in Multica.',
  icon: 'IconTicket',
  component: CreateTicketForm,
});
