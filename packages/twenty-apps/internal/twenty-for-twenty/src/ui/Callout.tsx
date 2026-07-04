import { IconHelp, type IconComponent } from '@ui/icons';

// Inline reimplementation of twenty-ui's `Callout`, styled with the Twenty
// theme's `--t-*` CSS variables (injected by the front-component host). Only
// the subset the app uses is kept: variant, title, description and Icon.
export type CalloutVariant =
  | 'info'
  | 'warning'
  | 'error'
  | 'neutral'
  | 'success';

type CalloutVariantColors = {
  background: string;
  border: string;
  icon: string;
};

const VARIANT_COLORS: Record<CalloutVariant, CalloutVariantColors> = {
  info: {
    background: 'var(--t-accent-accent1)',
    border: 'var(--t-accent-accent6)',
    icon: 'var(--t-accent-accent9)',
  },
  warning: {
    background: 'var(--t-color-orange1)',
    border: 'var(--t-color-orange6)',
    icon: 'var(--t-color-orange9)',
  },
  success: {
    background: 'var(--t-color-turquoise1)',
    border: 'var(--t-color-turquoise6)',
    icon: 'var(--t-color-turquoise9)',
  },
  error: {
    background: 'var(--t-color-red1)',
    border: 'var(--t-color-red6)',
    icon: 'var(--t-color-red9)',
  },
  neutral: {
    background: 'var(--t-color-gray1)',
    border: 'var(--t-color-gray6)',
    icon: 'var(--t-color-gray9)',
  },
};

export type CalloutProps = {
  variant: CalloutVariant;
  title: string;
  description: string;
  Icon?: IconComponent;
};

export const Callout = ({
  variant,
  title,
  description,
  Icon = IconHelp,
}: CalloutProps) => {
  const colors = VARIANT_COLORS[variant];

  return (
    <div
      style={{
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 'var(--t-spacing-2)',
        width: '100%',
        maxWidth: '512px',
        padding: 'var(--t-spacing-3) var(--t-spacing-3) var(--t-spacing-2)',
        border: `1px solid ${colors.border}`,
        borderRadius: 'var(--t-border-radius-md)',
        background: colors.background,
        fontFamily: 'var(--t-font-family)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'stretch',
          gap: 'var(--t-spacing-2)',
          minHeight: 'var(--t-spacing-6)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            height: 'var(--t-spacing-4)',
            width: 'var(--t-spacing-4)',
            color: colors.icon,
          }}
        >
          <Icon size={16} />
        </div>
        <div
          style={{
            flex: 1,
            color: 'var(--t-font-color-primary)',
            fontSize: 'var(--t-font-size-md)',
            fontWeight: 'var(--t-font-weight-medium)' as React.CSSProperties['fontWeight'],
            lineHeight: 1.4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          alignSelf: 'stretch',
          paddingLeft: 'var(--t-spacing-6)',
          paddingBottom: 'var(--t-spacing-2)',
        }}
      >
        <div
          style={{
            flex: 1,
            color: 'var(--t-font-color-tertiary)',
            fontSize: 'var(--t-font-size-sm)',
            fontWeight: 'var(--t-font-weight-regular)' as React.CSSProperties['fontWeight'],
            lineHeight: 1.4,
          }}
        >
          {description}
        </div>
      </div>
    </div>
  );
};
