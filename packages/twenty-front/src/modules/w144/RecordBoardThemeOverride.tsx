import { CSSProperties, ReactNode } from 'react';
import './RivieraNights.css';

/**
 * W144 Design System — Twenty Override Layer
 *
 * Maps Twenty's --t-* tokens to W144 light theme values.
 * Applies Riviera Nights typography.
 * Wraps Twenty UI without modifying upstream code.
 *
 * Phase 0 Day 2 experiment.
 */
const W144_LIGHT_TOKENS: CSSProperties = {
  // === Typography ===
  fontFamily:
    '"Riviera Nights", "SF Pro Display", -apple-system, "Segoe UI", system-ui, sans-serif',

  // === Backgrounds ===
  '--t-background-primary': '#FFFFFF',
  '--t-background-secondary': '#E8E4DC',
  '--t-background-tertiary': '#EDE9E2',
  '--t-background-quaternary': 'rgba(0, 0, 0, 0.04)',
  '--t-background-transparent-strong': 'rgba(0, 0, 0, 0.08)',
  '--t-background-transparent-medium': 'rgba(0, 0, 0, 0.04)',
  '--t-background-transparent-light': 'rgba(0, 0, 0, 0.02)',

  // === Text ===
  '--t-font-color-primary': '#1A1A1A',
  '--t-font-color-secondary': 'rgba(26, 26, 26, 0.65)',
  '--t-font-color-tertiary': 'rgba(26, 26, 26, 0.46)',
  '--t-font-color-light': 'rgba(26, 26, 26, 0.35)',
  '--t-font-color-extra-light': 'rgba(26, 26, 26, 0.20)',

  // === Borders ===
  '--t-border-color-medium': 'rgba(0, 0, 0, 0.10)',
  '--t-border-color-light': 'rgba(0, 0, 0, 0.06)',
  '--t-border-color-strong': 'rgba(0, 0, 0, 0.16)',

  // === Accent — W144 vivid gold ===
  '--t-accent-primary': '#F2AD0A',
  '--t-accent-secondary': '#F9BE2A',
  '--t-accent-tertiary': 'rgba(242, 173, 10, 0.32)',
  '--t-accent-quaternary': 'rgba(242, 173, 10, 0.20)',

  // === Shadows ===
  '--t-box-shadow-light': '0 1px 2px rgba(0, 2, 15, 0.04), 0 4px 12px rgba(0, 2, 15, 0.05)',
  '--t-box-shadow-strong': '0 2px 4px rgba(0, 2, 15, 0.04), 0 8px 20px rgba(0, 2, 15, 0.06)',
} as CSSProperties;

interface Props {
  children: ReactNode;
}

export const W144ThemeOverride = ({ children }: Props) => (
  <div style={W144_LIGHT_TOKENS}>{children}</div>
);
