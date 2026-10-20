import { type ReactNode } from 'react';
import { Card, type CardContentProps } from 'twenty-ui/primitives/surfaces';
import { isDefined } from 'twenty-ui/utilities';
import styles from './SettingsCardContent.module.scss';

type SettingsCardContentProps = {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  hasDivider?: boolean;
  render?: CardContentProps['render'];
};

export const SettingsCardContent = ({
  icon,
  title,
  description,
  children,
  hasDivider,
  render,
}: SettingsCardContentProps) => (
  <Card.Content className={styles.content} divider={hasDivider} render={render}>
    {isDefined(icon) && <div className={styles.icon}>{icon}</div>}
    <div className={styles.text}>
      <div className={styles.title}>{title}</div>
      {isDefined(description) && (
        <div className={styles.description}>{description}</div>
      )}
    </div>
    {isDefined(children) && <div className={styles.actions}>{children}</div>}
  </Card.Content>
);
