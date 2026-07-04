import { type ThemeColor } from '@ui/theme-color';

// Inline reimplementation of twenty-ui's `Status` pill, styled with the Twenty
// theme's `--t-tag-*` CSS variables. The leading dot (twenty-ui renders it as a
// `::before`) is an explicit element here, and the loader is a self-contained
// SMIL-animated SVG so no `@keyframes` injection is required in front-components.
export type StatusProps = {
  color: ThemeColor;
  text: string;
  isLoaderVisible?: boolean;
};

const StatusLoader = ({ colorVar }: { colorVar: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke={colorVar}
      strokeOpacity="0.25"
      strokeWidth="3"
    />
    <path d="M21 12a9 9 0 0 0 -9 -9" stroke={colorVar} strokeWidth="3" strokeLinecap="round">
      <animateTransform
        attributeName="transform"
        type="rotate"
        from="0 12 12"
        to="360 12 12"
        dur="0.8s"
        repeatCount="indefinite"
      />
    </path>
  </svg>
);

export const Status = ({ color, text, isLoaderVisible = false }: StatusProps) => {
  const backgroundVar = `var(--t-tag-background-${color})`;
  const textColorVar = `var(--t-tag-text-${color})`;

  return (
    <h3
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--t-spacing-1)',
        height: 'var(--t-spacing-5)',
        margin: 0,
        padding: isLoaderVisible
          ? '0 var(--t-spacing-1) 0 var(--t-spacing-2)'
          : '0 var(--t-spacing-2)',
        borderRadius: 'var(--t-border-radius-pill)',
        background: backgroundVar,
        color: textColorVar,
        fontSize: 'var(--t-font-size-md)',
        fontWeight: 'var(--t-font-weight-regular)' as React.CSSProperties['fontWeight'],
        fontStyle: 'normal',
        overflow: 'hidden',
      }}
    >
      <span
        style={{
          flexShrink: 0,
          height: 'var(--t-spacing-1)',
          width: 'var(--t-spacing-1)',
          borderRadius: 'var(--t-border-radius-rounded)',
          background: textColorVar,
        }}
      />
      <span
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {text}
      </span>
      {isLoaderVisible ? <StatusLoader colorVar={textColorVar} /> : null}
    </h3>
  );
};
