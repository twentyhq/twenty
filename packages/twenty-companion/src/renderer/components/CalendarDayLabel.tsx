import styles from './CalendarDayLabel.module.scss';

type CalendarDayLabelProps = { weekday: string; day: string };

export const CalendarDayLabel = ({ weekday, day }: CalendarDayLabelProps) => (
  <div className={styles.label}>
    <div className={styles.weekday}>{weekday}</div>
    <div className={styles.day}>{day}</div>
  </div>
);
