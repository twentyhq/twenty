import { type CSSProperties, useEffect, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  enqueueSnackbar,
  useFrontComponentExecutionContext,
} from 'twenty-sdk/front-component';

import { TEMPLATE_EDITOR_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { Markdown } from 'src/utils/markdown-to-react';

const useCurrentRecordId = (): string | null =>
  useFrontComponentExecutionContext((context) =>
    context.recordId ??
    (context.selectedRecordIds.length === 1
      ? context.selectedRecordIds[0]
      : null),
  );

const styles: Record<string, CSSProperties> = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    fontFamily: 'var(--t-font-family, sans-serif)',
    background: 'var(--t-background-primary, #fff)',
  },
  bar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 16px',
    borderBottom: '1px solid var(--t-border-color-light, #eee)',
  },
  hint: { fontSize: '12px', color: 'var(--t-font-color-tertiary, #888)' },
  button: {
    height: '32px',
    padding: '0 14px',
    borderRadius: 'var(--t-border-radius-sm, 4px)',
    border: 'none',
    background: 'var(--t-color-blue, #1961ed)',
    color: '#fff',
    fontWeight: 500,
    cursor: 'pointer',
  },
  split: { display: 'flex', flex: 1, minHeight: 0 },
  editor: {
    flex: 1,
    padding: '20px',
    border: 'none',
    outline: 'none',
    resize: 'none',
    fontFamily: "'SFMono-Regular', Menlo, monospace",
    fontSize: '13px',
    lineHeight: 1.6,
    color: 'var(--t-font-color-primary, #1f2430)',
    background: 'var(--t-background-secondary, #fafafa)',
    borderRight: '1px solid var(--t-border-color-light, #eee)',
  },
  preview: { flex: 1, overflow: 'auto', background: '#eef1f6', padding: '20px' },
  paper: {
    background: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 6px 24px rgba(24, 39, 75, 0.08)',
    padding: '32px 36px',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, sans-serif",
  },
};

const TemplateEditor = () => {
  const recordId = useCurrentRecordId();
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!recordId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const load = async () => {
      const { documentTemplates } = await new CoreApiClient().query({
        documentTemplates: {
          __args: { filter: { id: { eq: recordId } }, first: 1 },
          edges: { node: { id: true, body: true } },
        },
      });
      if (cancelled) return;
      setBody(documentTemplates?.edges?.[0]?.node?.body ?? '');
    };
    load().finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [recordId]);

  const save = async () => {
    if (!recordId) return;
    setSaving(true);
    try {
      await new CoreApiClient().mutation({
        updateDocumentTemplate: {
          __args: { id: recordId, data: { body } },
          id: true,
        },
      });
      await enqueueSnackbar({ message: 'Template saved.', variant: 'success' });
    } catch {
      await enqueueSnackbar({ message: 'Could not save template.', variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '32px', color: '#888' }}>Loading…</div>;
  }

  return (
    <div style={styles.root}>
      <div style={styles.bar}>
        <span style={styles.hint}>
          Markdown · use placeholders like <code>{'{{name.firstName}}'}</code>
        </span>
        <button type="button" style={styles.button} onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save template'}
        </button>
      </div>
      <div style={styles.split}>
        <textarea
          style={styles.editor}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Write your template in Markdown…"
          spellCheck={false}
        />
        <div style={styles.preview}>
          <div style={styles.paper}>
            <Markdown content={body} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: TEMPLATE_EDITOR_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'template-editor',
  description: 'Edit a document template in Markdown with a live preview.',
  component: TemplateEditor,
});
