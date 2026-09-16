import { useEffect, useState } from 'react';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { useFrontComponentId, useTranslate } from 'twenty-sdk/front-component';
import { Button } from 'twenty-ui/input';
import { H2Title } from 'twenty-ui/typography';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type ApplicationVariable = {
  key: string;
  value: string;
  description?: string | null;
};

export const DesktopSettings = () => {
  const { t } = useTranslate();
  const frontComponentId = useFrontComponentId();
  const [applicationId, setApplicationId] = useState<string>();
  const [variables, setVariables] = useState<ApplicationVariable[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const labels: Record<string, string> = {
    DESKTOP_DOWNLOAD_URL: t('macOS download URL'),
    COMPANION_SUMMARY_ENABLED: t('AI summaries'),
    COMPANION_TRANSCRIPT_PROVIDER: t('Transcript provider'),
    COMPANION_ADDITIONAL_SUMMARY_PROMPT: t('Additional summary instructions'),
  };
  const inputStyle = {
    padding: themeCssVariables.spacing[2],
    color: themeCssVariables.font.color.primary,
    background: themeCssVariables.background.secondary,
    border: `1px solid ${themeCssVariables.border.color.medium}`,
    borderRadius: themeCssVariables.border.radius.sm,
    font: 'inherit',
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const client = new MetadataApiClient();
        const component = await client.query({
          frontComponent: {
            __args: { id: frontComponentId },
            applicationId: true,
          },
        });
        const id = component.frontComponent?.applicationId;
        if (!id) throw new Error('Settings application not found');
        const result = await client.query({
          findOneApplication: {
            __args: { id },
            applicationVariables: {
              key: true,
              value: true,
              description: true,
              isDeprecated: true,
              isSecret: true,
            },
          },
        });
        if (cancelled) return;
        setVariables(
          (result.findOneApplication?.applicationVariables ?? []).filter(
            (variable) => !variable.isDeprecated && !variable.isSecret,
          ),
        );
        setApplicationId(id);
      } catch {
        if (!cancelled) setError(true);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [frontComponentId]);

  const save = async () => {
    if (!applicationId) return;
    setSaving(true);
    setError(false);
    try {
      const client = new MetadataApiClient();
      for (const [key, value] of Object.entries(drafts)) {
        await client.mutation({
          updateOneApplicationVariable: {
            __args: { applicationId, key, value },
          },
        });
      }
      setVariables(
        variables.map((variable) => ({
          ...variable,
          value: drafts[variable.key] ?? variable.value,
        })),
      );
      setDrafts({});
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  };

  let downloadUrl: string | undefined;
  try {
    const url = new URL(
      variables.find(({ key }) => key === 'DESKTOP_DOWNLOAD_URL')?.value ?? '',
    );
    if (url.protocol === 'https:' && !url.username && !url.password)
      downloadUrl = url.href;
  } catch {
    // Unpublished releases have no download URL.
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: themeCssVariables.spacing[4],
      }}
    >
      <H2Title
        title={t('Twenty for macOS')}
        description={t(
          'Record meetings on your computer and find transcripts and summaries in this workspace.',
        )}
      />
      {downloadUrl ? (
        <a
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            ...inputStyle,
            alignSelf: 'flex-start',
            textDecoration: 'none',
          }}
        >
          {t('Download Twenty for macOS')}
        </a>
      ) : (
        <p>
          {t('Add the published macOS release URL below to enable downloads.')}
        </p>
      )}
      <p>
        {t(
          'Requires macOS 14.2 or later on Apple silicon. Install Twenty in Applications, then connect this workspace through your browser. Each person signs in with their own Twenty account.',
        )}
      </p>
      {error && (
        <p role="alert">
          {t(
            'Could not load or save settings. Your edits are kept; try again or reopen this page.',
          )}
        </p>
      )}
      {!applicationId && !error && <p>{t('Loading settings…')}</p>}
      {variables.map(({ key, value, description }) => (
        <label
          key={key}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: themeCssVariables.spacing[1],
          }}
        >
          <span>{labels[key] ?? key}</span>
          <span style={{ color: themeCssVariables.font.color.secondary }}>
            {description}
          </span>
          {key === 'COMPANION_SUMMARY_ENABLED' ? (
            <input
              type="checkbox"
              checked={(drafts[key] ?? value) === 'true'}
              disabled={saving}
              onChange={(event) =>
                setDrafts({ ...drafts, [key]: String(event.target.checked) })
              }
            />
          ) : key === 'COMPANION_TRANSCRIPT_PROVIDER' ? (
            <select
              value={drafts[key] ?? value}
              disabled={saving}
              style={inputStyle}
              onChange={(event) =>
                setDrafts({ ...drafts, [key]: event.target.value })
              }
            >
              <option value="recallai_async">Recall.ai</option>
              <option value="gladia_v2_async">Gladia</option>
            </select>
          ) : (
            <input
              value={drafts[key] ?? value}
              disabled={saving}
              onChange={(event) =>
                setDrafts({ ...drafts, [key]: event.target.value })
              }
              style={inputStyle}
            />
          )}
        </label>
      ))}
      {applicationId && (
        <Button
          title={t('Save settings')}
          disabled={saving || Object.keys(drafts).length === 0}
          onClick={() => void save()}
        />
      )}
    </div>
  );
};
