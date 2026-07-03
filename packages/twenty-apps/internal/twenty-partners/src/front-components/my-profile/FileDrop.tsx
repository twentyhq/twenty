import { type ChangeEvent, useState } from 'react';
import { enqueueSnackbar } from 'twenty-sdk/front-component';

import { callAppRoute } from '../call-app-route';
import type { UploadFileResult } from './types';

type FileDropProps = {
  label: string;
  currentUrl: string | null;
  target: 'profilePicture' | 'caseStudyCover';
  recordId?: string;
  onUploaded: (url: string) => void;
};

const readFileAsBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Failed to read file'));
        return;
      }
      resolve(result.split(',')[1] ?? '');
    };
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });

export const FileDrop = ({ label, currentUrl, target, recordId, onUploaded }: FileDropProps) => {
  const [uploading, setUploading] = useState(false);

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setUploading(true);
    try {
      const dataBase64 = await readFileAsBase64(file);
      const result = (await callAppRoute('/upload-my-partner-file', {
        target,
        recordId,
        filename: file.name,
        contentType: file.type,
        dataBase64,
      })) as UploadFileResult;

      if (result.ok) {
        onUploaded(result.url);
        await enqueueSnackbar({ message: 'Image uploaded', variant: 'success' });
      } else {
        await enqueueSnackbar({ message: result.reason, variant: 'error' });
      }
    } catch (error) {
      await enqueueSnackbar({
        message: error instanceof Error ? error.message : 'Upload failed',
        variant: 'error',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
      <span style={{ fontSize: 13, opacity: 0.7 }}>{label}</span>
      {currentUrl ? (
        <img
          src={currentUrl}
          alt={label}
          style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 4 }}
        />
      ) : null}
      <input type="file" accept="image/*" onChange={handleChange} disabled={uploading} />
    </div>
  );
};
