# Translating front components

Front components can localize the strings they render. You mark translatable
strings in source with a small Lingui-inspired API, extract them into per-locale
catalogs, translate those catalogs, and the build bakes them into the component
bundle so the right language is shown for the current user — no extra wiring.

This is the same `locales/` pipeline that already translates your manifest
labels (object/field names, view titles, menu items); front-component strings
are simply added to the same catalogs.

## Marking strings

Import the translation helpers from `twenty-sdk/front-component`:

```tsx
import { Trans, t, msg, useLingui } from 'twenty-sdk/front-component';

const STATUSES = [
  { id: 'draft', label: msg('Draft') },
  { id: 'sent', label: msg('Sent') },
];

const Card = ({ count, name }: { count: number; name: string }) => {
  const { t } = useLingui();

  return (
    <section>
      {/* Static text — reactive to the user's locale */}
      <Trans>Loading postcard…</Trans>

      {/* Disambiguate identical sources with a context */}
      <Trans context="card-title">Untitled</Trans>

      {/* Interpolation: pass values explicitly */}
      <p>{t('Hi {name}', { name })}</p>
      <p>{t('Saved {count} cards', { count })}</p>

      {/* Resolve a lazily-declared descriptor */}
      <ul>{STATUSES.map((s) => <li key={s.id}>{t(s.label)}</li>)}</ul>
    </section>
  );
};
```

### When to use which

- **`<Trans>…</Trans>`** — static text in JSX. Use the `message` and `values`
  props for interpolation (`<Trans message="Hi {name}" values={{ name }} />`);
  interpolating directly in the children is not statically extractable.
- **`useLingui().t`** — dynamic strings inside a component. Re-renders when the
  user switches language. Prefer this inside render.
- **`t(...)`** (imported directly) — eager translation usable **anywhere**, including
  event handlers, helpers, and module scope — not only inside render.
- **`msg(...)`** — a lazy descriptor for strings declared as data (constants,
  config). Resolve it later with `t(descriptor)`.

### Context

Pass `context` to disambiguate identical source strings that translate
differently:

```tsx
t({ message: 'Open', context: 'door' });
t({ message: 'Open', context: 'window' });
<Trans context="card-title">Untitled</Trans>
```

## Extracting and translating

Run the extract command from your app directory:

```bash
twenty dev i18n-extract            # collect strings into locales/en.json
twenty dev i18n-extract --locale fr-FR   # also scaffold a target locale
```

Extraction collects both your manifest labels and the `t()`/`msg()`/`<Trans>`
strings from your front-component source into `locales/<locale>.json`, keyed by
source string. Fill in the translations:

```json
// locales/fr-FR.json
{
  "Loading postcard…": "Chargement de la carte…",
  "Hi {name}": "Bonjour {name}",
  "Saved {count} cards": "{count} cartes enregistrées"
}
```

Placeholders like `{name}` are substituted at runtime — keep them in the
translation. Any string left empty falls back to the source text.

## How it runs

`twenty build` bakes the compiled catalogs into each front-component bundle. At
runtime the component reads the locale from its execution context (the host's
current language) and resolves each string against the baked catalog, falling
back to the source when a translation is missing. Switching language in the host
re-renders `<Trans>` and `useLingui().t` strings live.

Because catalogs are baked at build time, updating a translation means
re-running `twenty build` (and redeploying), the same as any other change to the
component.

> **Note:** translations are baked by `twenty build` (and `twenty dev --once`).
> The continuous `twenty dev` watch shows source strings, so test localized
> output with a one-off build.

`<Trans>` text children may span multiple lines — whitespace is collapsed the
same way JSX collapses it, so `<Trans>Welcome\n  back</Trans>` and the extracted
key both become `Welcome back`.
