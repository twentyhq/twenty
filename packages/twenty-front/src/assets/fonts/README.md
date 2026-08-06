# Fonts

These exist only for PDF export (`exportBlockNoteEditorToPdf`). The app itself
renders with `@fontsource/inter`; do not use these files for UI.

`@react-pdf/renderer` registers one file per weight with no unicode-range
support, so it needs a single file covering every script a note might contain.
`@fontsource/inter` cannot provide that: it ships Inter split into seven
per-script files. These are the full-coverage Inter builds Google Fonts
publishes (2849 codepoints: Latin, Latin-ext, Greek, Cyrillic, Vietnamese),
which is exactly what the exporter used to fetch from `fonts.gstatic.com`.

Copied verbatim from the `@expo-google-fonts/inter@0.4.2` npm tarball, which
redistributes those builds under the SIL Open Font License 1.1:

| File            | Source in tarball                  | sha256                                                             |
| --------------- | ---------------------------------- | ------------------------------------------------------------------ |
| `inter-400.ttf` | `400Regular/Inter_400Regular.ttf`  | `a414b48aa577ef2c62ebb135341ddeef33ee26a4f5dc9f787f93c1aab08ebb50` |
| `inter-500.ttf` | `500Medium/Inter_500Medium.ttf`    | `f1738576525e86db1d5cf63a6c1b56e0a7e2a2898b499ac93db95f2e7a9f9cd5` |
| `inter-600.ttf` | `600SemiBold/Inter_600SemiBold.ttf` | `f30e9d2574c3bec5144347ff965f9841c8f06857f0b7383000f8c9489a161841` |

Keep them as TTF. fontkit parses woff2, but `@react-pdf`'s subsetter throws
`RangeError: Offset is outside the bounds of the DataView` on the transformed
glyf table that woff2 stores, so a woff2 swap breaks every export.
