import { AnimatedPlaceholder } from '@ui/primitives/feedback/AnimatedPlaceholder/AnimatedPlaceholder';
import type { AnimatedPlaceholderType } from '@ui/primitives/feedback/AnimatedPlaceholder/types/AnimatedPlaceholderType';
import { type ReactNode } from 'react';

export const Empty = ({
  icon,
  animatedPlaceholderType,
  title,
  children,
  actions,
}: {
  icon?: ReactNode;
  animatedPlaceholderType?: AnimatedPlaceholderType;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}) => (
  <div className="empty">
    {animatedPlaceholderType ? (
      <AnimatedPlaceholder type={animatedPlaceholderType} assetBasePath="." />
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
