import { type ReactNode } from 'react';
import styles from './SettingsCardContent.module.scss';

type SettingsCardContentProps = {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
};

export const SettingsCardContent = ({
  icon,
  title,
  description,
  children,
}: SettingsCardContentProps) => (
  <div className={styles.content}>
    {icon != null && <div className={styles.icon}>{icon}</div>}
    <div className={styles.text}>
      <div className={styles.title}>{title}</div>
      {description != null && (
        <div className={styles.description}>{description}</div>
      )}
    </div>
    {children != null && <div className={styles.actions}>{children}</div>}
  </div>
);
