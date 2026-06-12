# Twenty Website — DESIGN.md

> Visual system for the Twenty marketing site. Distilled from `packages/twenty-website/src/theme/`. Loaded by every `impeccable` invocation alongside PRODUCT.md.

## Theme

**Light by default.** A founder browsing a partner profile in daylight on a 14–27 inch monitor is the default scene. The site does ship a `data-scheme="dark"` override (see `css-variables.ts`), but no current public page opts into it. Treat dark as a deferred surface.

## Color

Palette is OKLCH-equivalent neutrals at the surface level. The brand accents (blue, pink, yellow, green) are present in the token system but used sparingly — none of them appear on the partner pages.

### Strategy: Restrained

Tinted neutrals + one accent ≤10%. The accent for partner pages is the deep ink black (`var(--color-black-100)`) used in CTAs and hover states. Anything beyond a hairline border, an icon glyph, or a primary CTA should question whether it needs color at all.

### Tokens (from `src/theme/colors.ts` + `css-variables.ts`)

Neutrals (the workhorses):

| Token | Hex (computed) | Role |
| --- | --- | --- |
| `colors.primary.background[100]` | `#ffffff` | Page + card surface |
| `colors.primary.text[100]` | `#1c1c1c` | Headlines, primary text |
| `colors.primary.text[80]` | `#1c1c1ccc` | Body text |
| `colors.primary.text[60]` | `#1c1c1c99` | Eyebrows, meta, captions |
| `colors.primary.text[40]` | `#1c1c1c66` | Disabled / placeholder |
| `colors.primary.text[20]` | `#1c1c1c33` | Subtle separators |
| `colors.primary.text[10]` | `#1c1c1c1a` | Hairline borders |
| `colors.primary.text[5]` | `#1c1c1c0d` | Subtle fills (rates panel, skill chips) |
| `colors.primary.border[10]` | `#1c1c1c1a` | Default border |
| `colors.primary.border[20]` | `#1c1c1c33` | Hover border |

Reverse palette (for dark CTAs):

| Token | Role |
| --- | --- |
| `colors.secondary.background[100]` | Filled CTA background (deep ink) |
| `colors.secondary.text[100]` | Filled CTA text (white) |

Brand accents (currently absent from partner pages; available if needed):

- `colors.accent.blue` — `#4a38f5` / `#8174f8`
- `colors.accent.pink` — `#ed87fc` / `#f3abfd`
- `colors.accent.yellow` — `#feffb7` / `#feffd9`
- `colors.accent.green` — `#89fc9a` / `#b0fdbe`
- `colors.highlight` — same hue as blue accent

**Do not introduce gradients, glass blurs, or saturated fills on partner pages.** Color is conviction here, not decoration.

## Typography

Three families, each load-balanced via CSS variables:

| Family | Var | Use |
| --- | --- | --- |
| `theme.font.family.serif` | `--font-serif` | Headlines, partner names, headline values |
| `theme.font.family.sans` | `--font-sans` | Body, prose, interactive labels |
| `theme.font.family.mono` | `--font-mono` | Eyebrows, meta, currency labels, tabular numerics |
| `theme.font.family.retro` | `--font-retro` | Reserved (not used on partner pages) |

### Weight + Size Contrast

Weights: `light: 300`, `regular: 400`, `medium: 500`. No bold. Hierarchy is driven by scale and family contrast, never by weight alone.

Scale (`theme.font.size(n)` → `calc(var(--font-base) * n)`, where `--font-base: 0.25rem` ≈ 4px):

- Display / h1: size 9–12 (36–48px)
- h2 / section heads: size 7–8 (28–32px)
- h3 / card heads: size 5–6 (20–24px)
- Body / prose: size 4–5 (16–20px)
- Eyebrow / meta: size 3 (12px) with `letter-spacing: 0.06–0.08em` and `text-transform: uppercase`

Body line length: cap at 65–75ch (the existing `PartnerProfileIntro` uses `max-width: 62ch` — keep that order of magnitude).

### Hierarchy contract

- A serif `<h1>` at size 9 light reads as a partner's name on the detail page.
- A mono eyebrow above or below it locates the partner (region · city · country).
- A serif size 6 light reads as a section head.
- Body prose is sans regular.
- Currency values are serif (they read as headline numbers, not stats).
- Currency labels and meta are mono.

## Spacing & Layout

Base unit `4px`. Spacing helper `theme.spacing(n)` returns `n * 4px`. Common rhythms on the partner pages:

- Inter-section gap on the detail page: `theme.spacing(10–14)` — generous, editorial breathing room.
- Inter-element gap inside a section: `theme.spacing(3–5)`.
- Card padding: `theme.spacing(6)`.
- Page horizontal padding: `theme.spacing(4)` mobile, `theme.spacing(10)` ≥ md breakpoint.

### Radius

`theme.radius(n)` returns `n * 2px`. The default card radius is `theme.radius(2)` = 4px. Pills use `999px`. No softer rounding than that.

### Borders

Borders are hairline (`1px solid theme.colors.primary.border[10]`). They define edges quietly. On hover they step to `border[20]`. Never use a chunky border as decoration.

## Components

### Card (PartnerCard, RatesPanel)

White surface, hairline border, 4px radius, 24px padding, soft shadow on hover only:

```css
background-color: ${theme.colors.primary.background[100]};
border: 1px solid ${theme.colors.primary.border[10]};
border-radius: ${theme.radius(2)};
padding: ${theme.spacing(6)};

&:hover {
  border-color: ${theme.colors.primary.border[20]};
  box-shadow: 0 12px 32px -16px rgba(0, 0, 0, 0.18);
  transform: translateY(-2px);
}
```

### Chip / Pill

Rounded `999px`, 1px border, subtle background fill (`primary.text[5]` for filter pills, transparent for chip rows), `text[80]` color, mono or sans font.

### Button / LinkButton

Lives in `@/design-system/components`. Two color modes: `primary` (deep ink fill, white text) and `secondary` (transparent fill, ink text + 1px border). `variant="contained"` is what partner pages use.

### Avatar

`PartnerAvatar` is a deterministic generated mark from name + slug. Used as fallback when `profilePictureUrl` is missing. The real photo overlays it at 120px circle on the detail page, 56px on the list card.

## Motion

- Hover transitions: 250ms, ease-out (cubic-bezier curve in `PartnerCard`: `0.25s ease`).
- Card entrance: 700ms cubic-bezier `0.22, 1, 0.36, 1` (ease-out-quart), 90ms stagger per index.
- All motion respects `@media (prefers-reduced-motion: reduce)` — animations stop, hover translate disabled.
- **No bounce, no elastic, no parallax.** Editorial restraint.

## Iconography

`@tabler/icons-react`, 14–16px on body-level chips, 18–24px on buttons. Always `aria-hidden="true"` when decorative. Stroke width `2` (default).

## Accessibility Defaults

- Focus ring: `outline: 2px solid theme.colors.primary.text[100]; outline-offset: 4px` (already used on the card link).
- Touch target ≥ 40×40px on mobile.
- `aria-label` on icon-only buttons, `aria-labelledby` on sectioned regions.
- All `<a target="_blank">` includes `rel="noopener noreferrer"`.
- Color is never the sole carrier of meaning. The money pills carry both an icon and a text label.

## Anti-patterns (project-specific)

In addition to the impeccable shared absolute bans:

- **Do not use the brand accent colors (blue/pink/yellow/green) on partner pages** unless we have a stronger reason than "to add color".
- **No skeuomorphic shadows on cards.** The hover shadow is `0 12px 32px -16px rgba(0,0,0,0.18)` — that's the ceiling.
- **No gradients on anything.** Including text, borders, and backgrounds.
- **No floating "Trusted by" logo bars** on partner pages.
