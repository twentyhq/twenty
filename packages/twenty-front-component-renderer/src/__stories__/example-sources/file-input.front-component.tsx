import { defineFrontComponent } from 'twenty-sdk/define';
import { type ChangeEvent, useState } from 'react';

type SelectedFile = {
  name: string;
  size: number;
  type: string;
  lastModified: number;
};

const CARD_STYLE = {
  padding: 24,
  backgroundColor: '#fef3c7',
  border: '2px solid #f59e0b',
  borderRadius: 12,
  fontFamily: 'system-ui, sans-serif',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 16,
  maxWidth: 480,
};

const HEADING_STYLE = {
  color: '#92400e',
  fontWeight: 700,
  fontSize: 18,
  margin: 0,
};

const LABEL_STYLE = {
  fontSize: 13,
  fontWeight: 600,
  color: '#374151',
};

const HINT_STYLE = {
  fontSize: 13,
  color: '#6b7280',
  fontFamily: 'monospace',
};

const LIST_STYLE = {
  margin: 0,
  paddingLeft: 16,
  fontSize: 13,
  fontFamily: 'monospace',
  color: '#374151',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 4,
};

const FileInputComponent = () => {
  const [singleFile, setSingleFile] = useState<SelectedFile | null>(null);
  const [multiFiles, setMultiFiles] = useState<SelectedFile[]>([]);

  return (
    <div data-testid="file-input-component" style={CARD_STYLE}>
      <h2 style={HEADING_STYLE}>File Input</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={LABEL_STYLE}>Single file</label>
        <input
          data-testid="single-file-input"
          type="file"
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            const detail = (
              event as unknown as { detail: { files?: SelectedFile[] } }
            ).detail;
            setSingleFile(detail?.files?.[0] ?? null);
          }}
        />
        <span data-testid="single-file-count" style={HINT_STYLE}>
          {singleFile === null ? 'none' : '1'}
        </span>
        {singleFile !== null && (
          <span data-testid="single-file-name" style={HINT_STYLE}>
            {singleFile.name} ({singleFile.size}B, {singleFile.type})
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={LABEL_STYLE}>Multiple files (image/*)</label>
        <input
          data-testid="multi-file-input"
          type="file"
          multiple
          accept="image/*"
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            const detail = (
              event as unknown as { detail: { files?: SelectedFile[] } }
            ).detail;
            setMultiFiles(detail?.files ?? []);
          }}
        />
        <span data-testid="multi-file-count" style={HINT_STYLE}>
          {multiFiles.length}
        </span>
        {multiFiles.length > 0 && (
          <ul data-testid="multi-file-list" style={LIST_STYLE}>
            {multiFiles.map((file) => (
              <li key={`${file.name}-${file.lastModified}`}>
                {file.name} ({file.size}B)
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'test-file-00000000-0000-0000-0000-000000000022',
  name: 'file-input-component',
  description:
    'Component verifying file input metadata is forwarded from host to worker',
  component: FileInputComponent,
});
