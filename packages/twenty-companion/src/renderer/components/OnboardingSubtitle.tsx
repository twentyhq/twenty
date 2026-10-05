import { clsx } from 'clsx';
import { type ComponentPropsWithoutRef } from 'react';
import styles from './OnboardingText.module.scss';

export const OnboardingSubtitle = ({
  className,
  ...props
}: ComponentPropsWithoutRef<'p'>) => (
  <p className={clsx(styles.subtitle, className)} {...props} />
);
