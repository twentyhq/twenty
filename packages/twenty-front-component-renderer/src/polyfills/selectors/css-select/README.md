# Ported css-select

This folder is a narrowed port of [`css-what`](https://github.com/fb55/css-what)
`6.1.0` (the selector parser) and [`css-select`](https://github.com/fb55/css-select)
`5.1.0` (the selector compiler), BSD-2-Clause, © Felix Böhm. It backs `matches`,
`closest`, `querySelector` and `querySelectorAll` in the front component worker.

It is ported in-tree so the renderer does not depend on either package or on
their `domutils`, `domhandler`, `nth-check` and `boolbase` dependencies.

## What was kept

- `parseSelectorList`: css-what's `parse`, including CSS escapes, namespaces and
  comments.
- `compileSelectorTokenList`, `compileSelectorToken`: css-select's `compileToken`
  and `compileGeneralSelector`, which chain one matcher per token from right to
  left.
- `compileAttributeSelectorToken`: css-select's attribute rules and its list of
  case-insensitive HTML attributes.
- `compilePseudoClassSelectorToken`, `compileHasPseudoClass`,
  `compileNthPseudoClass`: css-select's pseudo-class filters and `:is`, `:where`,
  `:not` and `:has` subselects.

## What was changed vs upstream

- Matchers receive a match context instead of reading css-select's compile-time
  `context`, so `:scope` resolves per call, including inside `:is`, `:where` and
  `:not`, and `:has` anchors its relative selectors to its subject through the
  same context.
- The DOM adapter, aliases, jQuery extensions (`:contains`, `:button`, ...),
  `:matches`, the parent (`<`) and column (`||`) combinators, `[attr!=value]`,
  rule sorting and result caching were dropped. Pseudo-classes other than
  `:nth-*`, `:is`, `:where`, `:not` and `:has` come from
  `PSEUDO_CLASS_MATCHER_BY_NAME` and `ARGUMENT_PSEUDO_CLASS_MATCHER_BY_NAME`.
- Validity follows browsers: pseudo-elements parse in the last compound of a
  top-level selector and never match, `:is` and `:where` drop unsupported
  arguments, `:has` cannot nest, and unknown pseudo-classes and undeclared
  namespace prefixes throw.
- `:nth-child` and `:nth-last-child` accept `of S`.

## License

BSD-2-Clause, see `LICENSE`.
