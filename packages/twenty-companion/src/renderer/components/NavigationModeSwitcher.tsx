import { type IconComponent } from '@ui/icon/types/IconComponent';
import { THEME_COMMON } from '@ui/theme/constants/ThemeCommon';
import styles from './NavigationModeSwitcher.module.scss';

type NavigationModeSwitcherProps = {
  activeItemName: string;
  ariaLabel: string;
  size?: 'small' | 'medium';
  items: {
    name: string;
    label: string;
    Icon: IconComponent;
    onClick: () => void;
  }[];
};

export const NavigationModeSwitcher = ({
  activeItemName,
  ariaLabel,
  items,
  size = 'small',
}: NavigationModeSwitcherProps) => (
  <div className={styles.container} role="group" aria-label={ariaLabel}>
    {items.map(({ name, label, Icon, onClick }) => {
      const isActive = name === activeItemName;
      return (
        <button
          key={name}
          type="button"
          className={styles.mode}
          data-active={isActive || undefined}
          data-size={size}
          aria-current={isActive}
          onClick={onClick}
        >
          <span className={styles.icon}>
            <Icon size={THEME_COMMON.icon.size.md} aria-hidden />
          </span>
          <span className={styles.label}>
            <span className={styles.labelText}>{label}</span>
          </span>
        </button>
      );
    })}
  </div>
);
