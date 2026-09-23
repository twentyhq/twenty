import { type ReactNode } from 'react';
import { RecordingEmptyIllustration } from './internal/RecordingEmptyIllustration';

export const Empty = ({
  icon,
  animatedPlaceholderType,
  title,
  children,
  actions,
}: {
  icon?: ReactNode;
  animatedPlaceholderType?: 'noCallRecording';
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}) => (
  <div className="empty">
    {animatedPlaceholderType ? (
      <RecordingEmptyIllustration />
    ) : (
      <span className="empty-icon">{icon}</span>
    )}
    <div className="empty-copy">
      <h2>{title}</h2>
      <div className="muted">{children}</div>
    </div>
    {actions != null && <div className="empty-actions">{actions}</div>}
  </div>
);
