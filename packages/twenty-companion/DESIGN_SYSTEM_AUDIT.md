# Companion design-system audit — 8 September 2026

Scope: Companion renderer and its shared Twenty UI consumers. Browser checks
cover onboarding through Home and Settings. This is not a full accessibility
or native window audit.

## Resolved

- Notifications use Twenty UI Banner with a shared dismiss IconButton.
- Shared controls retain their library focus treatment; custom focus styles
  apply only to custom rows and the connection input.
- Every onboarding step uses a full-width neutral MainButton for its primary
  action. Permission actions use the shared 32 px secondary Button.
- Standalone icons consume Twenty's ICON size and stroke constants.
- Local typography, spacing, and radii consume shared theme tokens.
- OnboardingTitle and OnboardingSubtitle are shared by web onboarding and
  Companion, with Companion retaining centered alignment.
- CalendarDayLabel and CalendarEventIndicator are shared by web calendar and
  Companion. Calendar data and desktop action layouts remain with their owners.
- Removed obsolete theme aliases and updated component documentation.

The audited duplication was resolved by extracting existing web presentation
into Twenty UI and migrating both consumers. The root 13 px font baseline,
cloud animation, and native titlebar geometry remain intentional desktop
configuration rather than substitutes for shared controls.

## Follow-up screening — Home headings

Home's Coming up and Recordings now use the same H2Title as Settings. Recording
search uses the component's adornment slot. Section accessible names remain
localized. This follow-up is a source screening of renderer components,
global CSS, theme aliases, and shared component implementations.

Remaining findings:

- P2: Global h1/h2/p rules in style.css supply letter spacing and line heights
  that shared headings and empty states do not always reset. Remove broad
  typography overrides or scope them to the custom content that needs them.
- P2: settings-link hover paints its wrapper, but SettingsCardContent has an
  opaque background. The hover feedback is hidden. Its disabled selectors
  also target the old .muted/direct-svg structure, so the new title,
  description, and nested icon do not receive the disabled treatment.
- P3: SettingsToggle wraps div-based card content in a label; navigation rows
  wrap that content in a button. Consolidate semantic row variants with
  explicit control labels instead of relying on these mixed wrappers.
- P3: PermissionChecklist still uses its own permission-item/icon layout,
  separate from the settings-row composition. Confirm whether onboarding
  should adopt the same icon container and row spacing before migrating it.
- P3: Dead settings-row, workspace-card, list-icon, and section-heading styles
  remain after component migrations. Remove them after checking consumers.
- P3: Empty-state icon dimensions and the control-height alias still use
  literals matching existing spacing tokens (48 px and 32 px).

Confirmed shared: Inter 400/500/600, light/dark themes, Button/IconButton,
SearchInput, Toggle, SegmentedControl, Card, Banner, Enabled Status,
SettingsCardContent, NavigationModeSwitcher, calendar labels/markers, and
onboarding title/subtitle. Recording lifecycle labels and Enabled permissions
use Status chips; no Tag usages remain in Companion. Native titlebar geometry, responsive
breakpoints, content width limits, and halftone parameters are intentional
layout/decorative values, not palette duplication.

Follow-up verification: Companion typecheck and macOS packaging pass. Home
headings and search alignment were visually checked in the browser preview.
Installation is pending while the desktop app is recording.

## Earlier verification

Companion typecheck and all 83 tests pass. Twenty UI builds successfully.
Browser verification covers the full simulated onboarding flow, shared primary
actions, Settings typography and controls, and dark Home layout. The macOS
app was rebuilt, installed, reopened, and visually checked. The broader twenty-front
check still reports existing errors outside the changed consumers; no errors
were reported for the migrated onboarding or calendar components.
