import { type ReactNode } from 'react';

const CARD_STYLE = {
  padding: 20,
  backgroundColor: '#ffffff',
  border: '2px solid #e5e7eb',
  borderRadius: 12,
  fontFamily: 'system-ui, sans-serif',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 12,
  maxWidth: 480,
};

const HEADING_STYLE = {
  color: '#111827',
  fontWeight: 700,
  fontSize: 16,
  margin: 0,
};

const MOUNTED_STYLE = {
  fontSize: 11,
  color: '#6b7280',
  fontFamily: 'monospace',
};

type FrontComponentCardProps = {
  title: string;
  children: ReactNode;
};

export const FrontComponentCard = ({
  title,
  children,
}: FrontComponentCardProps) => (
  <div data-testid="front-component-root" style={CARD_STYLE}>
    <h2 style={HEADING_STYLE}>{title}</h2>
    <span data-testid="front-component-mounted" style={MOUNTED_STYLE}>
      mounted
    </span>
    {children}
  </div>
);
