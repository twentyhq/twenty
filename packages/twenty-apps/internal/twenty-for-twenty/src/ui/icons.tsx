// Self-contained Tabler-style icons.
// Replaces the icons that used to come from `twenty-sdk/ui`, which stopped
// re-exporting `twenty-ui` in twenty-sdk 2.18. Paths mirror the outline
// variants of `@tabler/icons` so front-components keep the same visuals
// without depending on the (React 19 only) `twenty-ui` package.

export type IconComponentProps = {
  size?: number;
  color?: string;
  stroke?: number;
  className?: string;
  style?: React.CSSProperties;
};

export type IconComponent = (props: IconComponentProps) => React.ReactElement;

const createIcon =
  (children: React.ReactNode): IconComponent =>
  ({ size = 24, color = 'currentColor', stroke = 2, className, style }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {children}
    </svg>
  );

export const IconAlertCircle = createIcon(
  <>
    <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
    <path d="M12 8v4" />
    <path d="M12 16h.01" />
  </>,
);

export const IconInfoCircle = createIcon(
  <>
    <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
    <path d="M12 9h.01" />
    <path d="M11 12h1v4h1" />
  </>,
);

export const IconMail = createIcon(
  <>
    <path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10" />
    <path d="M3 7l9 6l9 -6" />
  </>,
);

export const IconRefresh = createIcon(
  <>
    <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" />
    <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
  </>,
);

export const IconHelp = createIcon(
  <>
    <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
    <path d="M12 17l0 .01" />
    <path d="M12 13.5a1.5 1.5 0 0 1 1 -1.5a2.6 2.6 0 1 0 -3 -4" />
  </>,
);
