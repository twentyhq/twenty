import { type CSSProperties, useState } from 'react';
import { enqueueSnackbar } from 'twenty-sdk/front-component';

import { callAppRoute } from '../call-app-route';
import { NumberField, TextField } from './fields';
import type { MyProfilePayload, SaveLinksResult } from './types';

type LinksSectionProps = {
  links: MyProfilePayload['links'];
  onSaved: (links: MyProfilePayload['links']) => void;
};

type EditableLinkRow = {
  id?: string;
  name: string;
  url: string;
  sortOrder: number | null;
};

const rowStyle: CSSProperties = {
  display: 'flex',
  gap: 8,
  alignItems: 'flex-end',
  marginBottom: 8,
};

const buildInitialRows = (links: MyProfilePayload['links']): EditableLinkRow[] =>
  links.map((link) => ({
    id: link.id,
    name: link.name ?? '',
    url: link.url ?? '',
    sortOrder: link.sortOrder,
  }));

const buildSaveBody = (rows: EditableLinkRow[]): Record<string, unknown> => ({
  links: rows.map((row) => ({
    id: row.id,
    name: row.name,
    url: row.url,
    sortOrder: row.sortOrder ?? undefined,
  })),
});

export const LinksSection = ({ links, onSaved }: LinksSectionProps) => {
  const [rows, setRows] = useState<EditableLinkRow[]>(() => buildInitialRows(links));
  const [saving, setSaving] = useState(false);

  const updateRow = <K extends keyof EditableLinkRow>(
    index: number,
    key: K,
    value: EditableLinkRow[K],
  ) => {
    setRows((previous) =>
      previous.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: value } : row)),
    );
  };

  const handleAdd = () => {
    setRows((previous) => [...previous, { name: '', url: '', sortOrder: null }]);
  };

  const handleRemove = (index: number) => {
    setRows((previous) => previous.filter((_, rowIndex) => rowIndex !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = (await callAppRoute(
        '/save-my-partner-links',
        buildSaveBody(rows),
      )) as SaveLinksResult;

      if (result.ok) {
        await enqueueSnackbar({ message: 'Links saved', variant: 'success' });
        onSaved(result.links);
        setRows(buildInitialRows(result.links));
      } else {
        await enqueueSnackbar({ message: result.reason, variant: 'error' });
      }
    } catch (error) {
      await enqueueSnackbar({
        message: error instanceof Error ? error.message : 'Failed to save links',
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {rows.map((row, index) => (
        <div key={row.id ?? `new-${index}`} style={rowStyle}>
          <TextField
            label="Name"
            value={row.name}
            onChange={(value) => updateRow(index, 'name', value)}
          />
          <TextField
            label="URL"
            value={row.url}
            onChange={(value) => updateRow(index, 'url', value)}
          />
          <NumberField
            label="Sort order"
            value={row.sortOrder}
            onChange={(value) => updateRow(index, 'sortOrder', value)}
          />
          <button type="button" onClick={() => handleRemove(index)}>
            Remove
          </button>
        </div>
      ))}

      <button type="button" onClick={handleAdd} style={{ marginBottom: 12 }}>
        Add link
      </button>

      <div>
        <button type="button" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
};
