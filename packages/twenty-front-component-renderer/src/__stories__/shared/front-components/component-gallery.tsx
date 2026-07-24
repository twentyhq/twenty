import { useEffect, useState, type ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

export type GalleryEntry = {
  name: string;
  node: ReactNode;
};

const GALLERY_STYLE = {
  padding: 20,
  backgroundColor: '#ffffff',
  border: '2px solid #e5e7eb',
  borderRadius: 12,
  fontFamily: 'system-ui, sans-serif',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 8,
  maxWidth: 640,
};

const HEADING_STYLE = {
  color: '#111827',
  fontWeight: 700,
  fontSize: 16,
  margin: 0,
};

const STATUS_STYLE = {
  fontSize: 11,
  fontFamily: 'monospace',
  color: '#6b7280',
};

const ITEM_STYLE = {
  display: 'flex',
  alignItems: 'center' as const,
  gap: 12,
  padding: '4px 0',
  borderBottom: '1px solid #f3f4f6',
};

const ITEM_LABEL_STYLE = {
  fontSize: 11,
  fontFamily: 'monospace',
  color: '#6b7280',
  minWidth: 200,
  flexShrink: 0,
};

const ITEM_FAILED_STYLE = {
  fontSize: 11,
  fontFamily: 'monospace',
  color: '#dc2626',
};

type ComponentGalleryProps = {
  title: string;
  entries: GalleryEntry[];
};

export const ComponentGallery = ({ title, entries }: ComponentGalleryProps) => {
  const [failedEntries, setFailedEntries] = useState<
    { name: string; message: string }[]
  >([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const reportFailedEntry = (entryName: string, thrownValue: unknown) => {
    // Error boundaries receive whatever was thrown, not necessarily an Error.
    const message =
      thrownValue instanceof Error ? thrownValue.message : String(thrownValue);

    setFailedEntries((previous) =>
      previous.some((failedEntry) => failedEntry.name === entryName)
        ? previous
        : [...previous, { name: entryName, message }],
    );
  };

  const failedEntryNames = failedEntries.map((failedEntry) => failedEntry.name);

  return (
    <div data-testid="gallery-root" style={GALLERY_STYLE}>
      <h2 style={HEADING_STYLE}>{title}</h2>
      {isMounted && (
        <span
          data-testid="gallery-status"
          data-total-count={entries.length}
          data-failed-count={failedEntryNames.length}
          data-failed-names={failedEntryNames.join(', ')}
          data-failed-messages={failedEntries
            .map((failedEntry) => `${failedEntry.name}: ${failedEntry.message}`)
            .join(' | ')}
          style={STATUS_STYLE}
        >
          {failedEntryNames.length === 0
            ? `All ${entries.length} components rendered`
            : `Failed to render: ${failedEntryNames.join(', ')}`}
        </span>
      )}
      {entries.map((entry) => (
        <div
          key={entry.name}
          data-testid={`gallery-item-${entry.name}`}
          style={ITEM_STYLE}
        >
          <span style={ITEM_LABEL_STYLE}>{entry.name}</span>
          <ErrorBoundary
            fallback={
              <span
                data-testid={`gallery-item-failed-${entry.name}`}
                style={ITEM_FAILED_STYLE}
              >
                render failed
              </span>
            }
            onError={(error) => reportFailedEntry(entry.name, error)}
          >
            {entry.node}
          </ErrorBoundary>
        </div>
      ))}
    </div>
  );
};
