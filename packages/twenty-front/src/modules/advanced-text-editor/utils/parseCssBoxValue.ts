export type CssBoxSides = {
  top: string;
  right: string;
  bottom: string;
  left: string;
};

// Expands a CSS box shorthand ("12px", "10px 20px", four values...) into its
// four sides, following the CSS 1-2-3-4 value rules.
export const parseCssBoxValue = (value: string | undefined): CssBoxSides => {
  const tokens = (value ?? '').trim().split(/\s+/).filter(Boolean);

  const [first = '', second = first, third = first, fourth = second] = tokens;

  return { top: first, right: second, bottom: third, left: fourth };
};
