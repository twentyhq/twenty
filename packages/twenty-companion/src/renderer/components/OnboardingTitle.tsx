import { clsx } from 'clsx';
import { type ComponentPropsWithoutRef } from 'react';
import styles from './OnboardingText.module.scss';

export const OnboardingTitle = ({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<'h1'>) => (
  <h1 className={clsx(styles.title, className)} {...props}>
    {children}
  </h1>
);
