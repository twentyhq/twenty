// Inline reimplementation of twenty-ui's `H2Title` (title-only usage), styled
// with the Twenty theme's `--t-*` CSS variables. The `margin-bottom` is kept
// identical to twenty-ui so the callers' negative-margin layout hack still lines up.
export type H2TitleProps = {
  title: string;
  className?: string;
};

export const H2Title = ({ title }: H2TitleProps) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        marginBottom: 'var(--t-spacing-4)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <h2
          style={{
            margin: 0,
            color: 'var(--t-font-color-primary)',
            fontSize: 'var(--t-font-size-md)',
            fontWeight:
              'var(--t-font-weight-semi-bold)' as React.CSSProperties['fontWeight'],
          }}
        >
          {title}
        </h2>
      </div>
    </div>
  );
};
