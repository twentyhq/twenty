// Avoid the SDK UI entrypoint until its bundle is safe for the browser runtime.
export const recordingThemeCssVariables = {
  background: {
    transparentBlue: 'var(--t-background-transparent-blue)',
    transparentDanger: 'var(--t-background-transparent-danger)',
  },
  border: {
    colorDanger: 'var(--t-border-color-danger)',
    colorLight: 'var(--t-border-color-light)',
    radiusMd: 'var(--t-border-radius-md)',
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
