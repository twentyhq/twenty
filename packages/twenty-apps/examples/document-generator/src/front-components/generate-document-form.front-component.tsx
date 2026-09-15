import {
  type CSSProperties,
  type SyntheticEvent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { RestApiClient } from 'twenty-client-sdk/rest';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  closeSidePanel,
  enqueueSnackbar,
  unmountFrontComponent,
  useSelectedRecordIds,
} from 'twenty-sdk/front-component';

import { GENERATE_DOCUMENT_FORM_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

// Theme tokens are inlined as CSS-variable values: the SDK mocks the UI package
// during manifest extraction, so importing them at module level would be undefined.
const theme = {
  spacing2: 'var(--t-spacing-2)',
  spacing3: 'var(--t-spacing-3)',
  spacing4: 'var(--t-spacing-4)',
  spacing8: 'var(--t-spacing-8)',
  bgPrimary: 'var(--t-background-primary)',
  bgSecondary: 'var(--t-background-secondary)',
  borderMedium: 'var(--t-border-color-medium)',
  borderLight: 'var(--t-border-color-light)',
  radiusSm: 'var(--t-border-radius-sm)',
  fontPrimary: 'var(--t-font-color-primary)',
  fontSecondary: 'var(--t-font-color-secondary)',
  fontTertiary: 'var(--t-font-color-tertiary)',
  fontInverted: 'var(--t-font-color-inverted)',
  fontFamily: 'var(--t-font-family)',
  sizeXs: 'var(--t-font-size-xs)',
  sizeSm: 'var(--t-font-size-sm)',
  sizeMd: 'var(--t-font-size-md)',
  weightMedium: 'var(--t-font-weight-medium)',
  weightSemiBold: 'var(--t-font-weight-semi-bold)',
  blue: 'var(--t-color-blue)',
  accent: 'var(--t-accent-accent4060)',
};

type Template = { id: string; name: string };

type GenerateResponse = {
  success: boolean;
  message?: string;
  documentId?: string;
  missingTokens?: string[];
  error?: string;
};

const readValue = (event: SyntheticEvent<HTMLElement>): string | undefined => {
  const object = event as {
    detail?: { value?: string };
    target?: { value?: string };
  };

  return object.detail?.value ?? object.target?.value;
};

const styles: Record<string, CSSProperties> = {
  container: {
    fontFamily: theme.fontFamily,
    fontSize: theme.sizeSm,
    color: theme.fontPrimary,
    background: theme.bgPrimary,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    boxSizing: 'border-box',
  },
  header: {
    padding: theme.spacing4,
    borderBottom: `1px solid ${theme.borderLight}`,
  },
  title: {
    fontSize: theme.sizeMd,
    fontWeight: theme.weightSemiBold,
    margin: 0,
  },
  subtitle: {
    fontSize: theme.sizeSm,
    color: theme.fontTertiary,
    margin: `${theme.spacing2} 0 0`,
  },
  body: {
    flex: 1,
    padding: theme.spacing4,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing2,
  },
  label: {
    fontSize: theme.sizeXs,
    fontWeight: theme.weightMedium,
    color: theme.fontSecondary,
  },
  select: {
    appearance: 'none',
    WebkitAppearance: 'none',
    background: theme.bgSecondary,
    border: `1px solid ${theme.borderMedium}`,
    borderRadius: theme.radiusSm,
    padding: `${theme.spacing2} ${theme.spacing3}`,
    color: theme.fontPrimary,
    fontSize: theme.sizeSm,
    fontFamily: theme.fontFamily,
    height: theme.spacing8,
    width: '100%',
    boxSizing: 'border-box',
    cursor: 'pointer',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing2,
    padding: theme.spacing3,
    borderTop: `1px solid ${theme.borderLight}`,
  },
  button: {
    height: theme.spacing8,
    padding: `0 ${theme.spacing3}`,
    borderRadius: theme.radiusSm,
    fontSize: theme.sizeSm,
    fontFamily: theme.fontFamily,
    fontWeight: theme.weightMedium,
    cursor: 'pointer',
    border: '1px solid transparent',
  },
  secondary: {
    background: theme.bgSecondary,
    color: theme.fontSecondary,
    border: `1px solid ${theme.borderMedium}`,
  },
  primary: { background: theme.blue, color: theme.fontInverted },
  primaryDisabled: { background: theme.accent, cursor: 'not-allowed' },
  helper: { fontSize: theme.sizeXs, color: theme.fontTertiary },
};

const GenerateDocumentForm = () => {
  const selectedRecordIds = useSelectedRecordIds();
  const recordId = selectedRecordIds.length === 1 ? selectedRecordIds[0] : null;

  const [templates, setTemplates] = useState<Template[]>([]);
  const [templateId, setTemplateId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadTemplates = useCallback(async () => {
    setLoading(true);

    try {
      const client = new CoreApiClient();
      const { documentTemplates } = await client.query({
        documentTemplates: {
          __args: { filter: { target: { eq: 'PERSON' } }, first: 100 },
          edges: { node: { id: true, name: true } },
        },
      });

      const list: Template[] =
        documentTemplates?.edges?.map(
          (edge: { node: { id: string; name?: string | null } }) => ({
            id: edge.node.id,
            name: edge.node.name ?? 'Untitled template',
          }),
        ) ?? [];

      setTemplates(list);

      if (list.length > 0) {
        setTemplateId(list[0].id);
      }
    } catch {
      await enqueueSnackbar({
        message: 'Failed to load templates.',
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const handleClose = () => {
    unmountFrontComponent();
    closeSidePanel();
  };

  const handleGenerate = async () => {
    if (!templateId || !recordId) {
      return;
    }

    setSubmitting(true);

    try {
      const result = await new RestApiClient().post<GenerateResponse>(
        '/s/documents/generate',
        { templateId, recordId },
      );

      if (!result.success) {
        await enqueueSnackbar({
          message: result.message ?? result.error ?? 'Generation failed.',
          variant: 'error',
        });

        return;
      }

      const missing = result.missingTokens?.length
        ? ` (${result.missingTokens.length} placeholder(s) had no value)`
        : '';

      await enqueueSnackbar({
        message: `Document generated${missing}. Find it in the Documents view.`,
        variant: 'success',
      });

      handleClose();
    } catch (error) {
      await enqueueSnackbar({
        message:
          error instanceof Error ? error.message : 'Generation failed.',
        variant: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit =
    templateId !== '' && recordId !== null && !submitting && !loading;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Generate document</h2>
        <p style={styles.subtitle}>
          Pick a template; it will be filled with this person's data.
        </p>
      </div>

      <div style={styles.body}>
        <label htmlFor="template-select" style={styles.label}>
          Template
        </label>
        <select
          id="template-select"
          value={templateId}
          onChange={(event) => {
            const value = readValue(event);

            if (typeof value === 'string') {
              setTemplateId(value);
            }
          }}
          style={styles.select}
          disabled={loading || templates.length === 0}
        >
          {templates.length === 0 ? (
            <option value="">No person templates yet</option>
          ) : (
            templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))
          )}
        </select>
        {recordId === null && (
          <span style={styles.helper}>
            Select a single person to generate a document.
          </span>
        )}
      </div>

      <div style={styles.footer}>
        <button
          type="button"
          style={{ ...styles.button, ...styles.secondary }}
          onClick={handleClose}
          disabled={submitting}
        >
          Cancel
        </button>
        <button
          type="button"
          style={{
            ...styles.button,
            ...styles.primary,
            ...(canSubmit ? {} : styles.primaryDisabled),
          }}
          onClick={handleGenerate}
          disabled={!canSubmit}
        >
          {submitting ? 'Generating…' : 'Generate'}
        </button>
      </div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier:
    GENERATE_DOCUMENT_FORM_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'generate-document-form',
  description: 'Form to generate a document from a template for a person.',
  component: GenerateDocumentForm,
});
