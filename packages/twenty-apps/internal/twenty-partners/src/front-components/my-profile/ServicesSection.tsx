import { type CSSProperties, useState } from 'react';
import { enqueueSnackbar } from 'twenty-sdk/front-component';

import { callAppRoute } from '../call-app-route';
import { NumberField, TextAreaField, TextField } from './fields';
import type { MyProfilePayload, SaveServicesResult } from './types';

type ServicesSectionProps = {
  services: MyProfilePayload['services'];
  onSaved: (services: MyProfilePayload['services']) => void;
};

type EditableServiceRow = {
  id?: string;
  title: string;
  description: string;
  sortOrder: number | null;
};

const rowStyle: CSSProperties = {
  display: 'flex',
  gap: 8,
  alignItems: 'flex-end',
  marginBottom: 8,
};

const buildInitialRows = (services: MyProfilePayload['services']): EditableServiceRow[] =>
  services.map((service) => ({
    id: service.id,
    title: service.title ?? '',
    description: service.description ?? '',
    sortOrder: service.sortOrder,
  }));

const buildSaveBody = (rows: EditableServiceRow[]): Record<string, unknown> => ({
  services: rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    sortOrder: row.sortOrder ?? undefined,
  })),
});

export const ServicesSection = ({ services, onSaved }: ServicesSectionProps) => {
  const [rows, setRows] = useState<EditableServiceRow[]>(() => buildInitialRows(services));
  const [saving, setSaving] = useState(false);

  const updateRow = <K extends keyof EditableServiceRow>(
    index: number,
    key: K,
    value: EditableServiceRow[K],
  ) => {
    setRows((previous) =>
      previous.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: value } : row)),
    );
  };

  const handleAdd = () => {
    setRows((previous) => [...previous, { title: '', description: '', sortOrder: null }]);
  };

  const handleRemove = (index: number) => {
    setRows((previous) => previous.filter((_, rowIndex) => rowIndex !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = (await callAppRoute(
        '/save-my-partner-services',
        buildSaveBody(rows),
      )) as SaveServicesResult;

      if (result.ok) {
        await enqueueSnackbar({ message: 'Services saved', variant: 'success' });
        onSaved(result.services);
        setRows(buildInitialRows(result.services));
      } else {
        await enqueueSnackbar({ message: result.reason, variant: 'error' });
      }
    } catch (error) {
      await enqueueSnackbar({
        message: error instanceof Error ? error.message : 'Failed to save services',
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
            label="Title"
            value={row.title}
            onChange={(value) => updateRow(index, 'title', value)}
          />
          <TextAreaField
            label="Description"
            value={row.description}
            onChange={(value) => updateRow(index, 'description', value)}
            rows={2}
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
        Add service
      </button>

      <div>
        <button type="button" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
};
