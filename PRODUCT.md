# Twenty Website — Product & Brand Context

> Strategic context for design work on the Twenty marketing site (`packages/twenty-website`). Loaded by every `impeccable` invocation.

## Register

**Brand.** The marketing site is a public-facing surface where the design itself is part of the credibility argument. Prospects evaluate Twenty partly by how the site feels. The product app (`packages/twenty-front`) is a separate product-register surface, governed elsewhere.

## Users & Purpose

The primary audience varies by route, but the working assumption for partner-related pages is:

- **Who:** A budget-holding decision maker (founder, RevOps lead, or COO) shopping for a CRM implementation partner. Already on Twenty's site, evaluating a shortlist of partners.
- **Context:** Doing a side-by-side comparison across 2–5 candidates over a single browsing session. Will spend 30–90 seconds on each profile before deciding whether to book a call.
- **Decision being made:** "Is this partner credible, the right size, the right specialty, and within budget? Do I trust them enough to commit 30 minutes to a discovery call?"

What the partner pages must do, in priority order:
1. Communicate credibility (real firm, real person, real work).
2. Surface fit signals fast (skills, region, languages, deployment expertise, budget range).
3. Give the visitor a confident "next step" affordance (book a call or vet via LinkedIn) without pressure.

## Desired Outcome

The redesign should make `/partners/profile/[slug]` feel like a *thoughtfully curated profile of a top-tier partner*, not a generic templated card. A visitor should leave thinking "this firm is serious" even if they don't book a call this session.

Specifically:
- **Confidence over information density.** A short, well-typeset profile beats a packed-but-busy one.
- **Editorial restraint.** White space, deliberate type hierarchy, and a few well-chosen details say more than dozens of small components.
- **Quiet conviction.** No hype copy, no growth-hack patterns, no "Trusted by" logo strips. The partner's own work and intro speak for themselves.

## Brand Personality

**Editorial · Founder-led · Considered.**

The site reads like a thoughtful indie publication, not a SaaS landing page. Serif headlines, plenty of whitespace, deliberate typographic rhythm. Quietly opinionated — Twenty has a point of view about CRM (open-source, customizable, well-designed) and the site reflects that without shouting.

Tonal anchors:
- Stripe's documentation for clarity, Linear's marketing for restraint, an editorial print magazine for typography choices.

## Anti-references

**Reject these patterns. They make the work read as generic AI / generic SaaS:**

- **Generic SaaS landing.** Big-number heroes, identical icon-grid cards, gradient text, navy + lime accent color schemes, "supercharge your workflow" language.
- **Corporate enterprise tone.** Stock photos of diverse handshakes. "Trusted by Fortune 500" logo strips as the primary credibility move. Trust-badge bars.
- **Bento templates.** Repetitive same-size cards. Vercel-style scroll-pin animations on every section.
- **Side-stripe borders, gradient text, glassmorphism, hero-metric templates, identical card grids** — see impeccable's shared absolute bans.

## Strategic Design Principles

1. **Typography carries the design.** The brand has a serif/sans/mono trio. Hierarchy is set by scale + weight contrast, not by color or borders.
2. **Restrained palette.** Tinted neutrals (black/white via CSS variables, with alpha-tone variants for text and borders) carry 90%+ of the surface. Accent color used sparingly when it appears at all.
3. **Whitespace is a feature.** Tight cards feel cheap. Pages should breathe.
4. **Asymmetry over grid.** A 12-col bento is the wrong shape for a profile page. Use asymmetric two-column layouts where one column does heavy lifting.
5. **One opinionated detail per page.** Each surface should have one moment of editorial conviction (a typographic flourish, a precise micro-interaction, a deliberate space) rather than five generic flourishes.

## Accessibility

**WCAG AA + keyboard + screen reader baseline:**

- All interactive elements reachable by keyboard, focus visible (`outline: 2px solid`, not just color shift).
- Semantic landmarks: `<header>`, `<main>`, `<nav>`, `<section aria-labelledby=…>`, headings in order.
- All images with informational content have alt text. Decorative icons have `aria-hidden="true"`.
- Body text ≥ 4.5:1 contrast; large text (≥18pt or 14pt bold) ≥ 3:1.
- Respect `prefers-reduced-motion`. Animations stop, don't slow.
- Forms have explicit labels. Errors are announced.

## Tech & Constraints

- Next.js 16 app router (Server Components by default, `'use client'` for interactivity).
- Linaria styled-components (`@linaria/react`) for zero-runtime CSS-in-JS.
- Lingui (`@lingui/react`) for i18n; never hardcode user-visible strings.
- Theme tokens in `packages/twenty-website/src/theme/`. Colors are CSS variables resolved to OKLCH-tinted neutrals.
- `@tabler/icons-react` for iconography (no Heroicons, no custom SVGs unless purposeful).
- `@radix-ui/react-*` for primitives (Popover etc) where headless behavior is needed.

## Out of Scope for This File

- Detailed visual tokens (colors, type scale, motion specs) live in `DESIGN.md`.
- Per-page IA decisions live in shape briefs (`docs/superpowers/specs/`).
