# Companion design system

Companion consumes Twenty UI source through the Vite `@ui` alias. Install
the monorepo root dependencies before the standalone Companion package.
The shared library dependencies, Sass tooling, and Inter fonts come from that
installation. Vite uses Twenty UI's Sass helpers and deduplicates React.

## Shared components

| Purpose                              | Component                                   |
| ------------------------------------ | ------------------------------------------- |
| Actions                              | Button and IconButton                       |
| Recording search                     | SearchInput                                 |
| Boolean settings                     | Toggle                                      |
| Appearance                           | SegmentedControl                            |
| Permission and recording status      | Tag                                         |
| Workspace and participant identity   | Avatar                                      |
| Settings, agenda, recording surfaces | Card                                        |
| Notifications                        | Banner with dismiss IconButton              |
| Onboarding primary actions           | MainButton                                  |
| Onboarding text                      | OnboardingTitle and OnboardingSubtitle      |
| Calendar date and marker             | CalendarDayLabel and CalendarEventIndicator |
| Home and Settings navigation         | NavigationModeSwitcher                               |
| Connection field                     | Field                                       |

Emphasized recording actions use `variant="primary" accent="blue"` in both themes.
Onboarding steps use the same full-width neutral MainButton.
Twenty UI's neutral primary is intentionally subtle. Secondary and tertiary
actions use default accents. All Companion action and icon buttons use the
32 px medium size. Pages must not override shared control colors, typography,
radii, padding, or interaction states.

The header uses shared desktop Home / Settings navigation. Recording search lives
on Home; recording/settings rows retain their distinct layout and semantics.
Field owns labels and validation; its unstyled Control receives token-based
input styling locally.

## Theme and typography

CompanionTheme installs shared light/dark CSS and ThemeProvider. Interface
text loads Inter explicitly. All headings and interface text use the shared Inter font family.
The root font size is 13 px, matching twenty-front: shared rem typography
must not inherit the browser's 16 px default. Keep controls at their library
dimensions; a future UI scale must scale text, spacing, icons, and geometry
together rather than changing the root font size.
theme.ts aliases shared semantics and defines Companion decoration and header
geometry; it does not maintain a separate palette or button implementation.

The header uses 16 px edge spacing and 32 px action controls. Native window
geometry remains platform-specific; verify alignment when changing controls.

The cloud and animation remain Companion-specific. Theme tokens control
opacity, accent extent, edge fading, and elevation. Light mode uses a faint
neutral gray texture with no blue accent.

## Verification

Run typecheck, tests, and production build. Use the built-in browser previews:
`?preview`, `?preview=welcome`, `?preview=permissions`, `?preview=denied`,
and `?preview=recording`. Visit Settings and search recordings from Home. Verify both
themes, keyboard focus, disabled actions, and field entry.

Preview actions simulate permissions and recording without capturing audio.
Rebuild and verify the installed app before claiming native-window or tray
parity; browser previews cannot verify these surfaces.
