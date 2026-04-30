export const THEME = {
  fontFamily:
    'var(--t-font-family, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)',
  borderRadius: 'var(--t-border-radius-sm, 4px)',

  fontPrimary: 'var(--t-font-color-primary)',
  fontSecondary: 'var(--t-font-color-secondary)',
  fontTertiary: 'var(--t-font-color-tertiary)',
  fontLight: 'var(--t-font-color-light)',

  borderLight: 'var(--t-border-color-light)',
  borderMedium: 'var(--t-border-color-medium)',

  bgPrimary: 'var(--t-background-primary)',
  bgSecondary: 'var(--t-background-secondary)',
  bgTertiary: 'var(--t-background-tertiary)',
  bgTransparentLight: 'var(--t-background-transparent-light)',
  bgTransparentLighter: 'var(--t-background-transparent-lighter)',

  chartAuthored: 'var(--t-color-purple)',
  chartMerged: 'var(--t-color-green)',
  chartReviewed: 'var(--t-color-blue)',
} as const;
