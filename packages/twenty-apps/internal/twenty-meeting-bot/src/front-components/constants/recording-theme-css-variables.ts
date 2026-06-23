// Avoid the SDK UI entrypoint until its bundle is safe for the browser runtime.
export const recordingThemeCssVariables = {
  accent: {
    primary: 'var(--t-accent-accent9)',
  },
  background: {
    primary: 'var(--t-background-primary)',
    secondary: 'var(--t-background-secondary)',
    transparentBlue: 'var(--t-background-transparent-blue)',
    transparentDanger: 'var(--t-background-transparent-danger)',
  },
  border: {
    colorDanger: 'var(--t-border-color-danger)',
    colorLight: 'var(--t-border-color-light)',
    colorMedium: 'var(--t-border-color-medium)',
    radiusMd: 'var(--t-border-radius-md)',
    radiusSm: 'var(--t-border-radius-sm)',
  },
  boxShadow: {
    light: 'var(--t-box-shadow-light)',
  },
  font: {
    colorDanger: 'var(--t-font-color-danger)',
    colorPrimary: 'var(--t-font-color-primary)',
    colorSecondary: 'var(--t-font-color-secondary)',
    colorTertiary: 'var(--t-font-color-tertiary)',
    family: 'var(--t-font-family)',
    sizeSm: 'var(--t-font-size-sm)',
    sizeXs: 'var(--t-font-size-xs)',
    weightMedium: 'var(--t-font-weight-medium)',
  },
  spacing: {
    1: 'var(--t-spacing-1)',
    2: 'var(--t-spacing-2)',
    3: 'var(--t-spacing-3)',
    4: 'var(--t-spacing-4)',
  },
} as const;
