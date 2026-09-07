// Front components render outside the host app's theme, so every panel restates the Twenty
// palette inline. Keep one copy here rather than one per domain.
export const COLORS = {
  bg: '#f7f7f8',
  surface: '#ffffff',
  surfaceAlt: '#f4f5f7',
  fg: '#1c1c1c',
  muted: '#66646a',
  border: '#e7e7eb',
  accent: '#4a38f5',
  accentSoft: 'rgba(74, 56, 245, 0.1)',
  danger: '#b42318',
} as const;

export const FONT =
  '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
