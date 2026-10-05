import { clsx } from 'clsx';
import styles from './CalendarDayLabel.module.scss';

type CalendarEventIndicatorProps = { active?: boolean; className?: string };

export const CalendarEventIndicator = ({
  active,
  className,
}: CalendarEventIndicatorProps) => (
  <div
    aria-hidden
    className={clsx(styles.indicator, className)}
    data-active={active || undefined}
  />
);
