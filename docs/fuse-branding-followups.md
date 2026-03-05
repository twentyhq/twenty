# Fuse Branding Follow-ups

Created: 2026-03-04
Scope: remaining branding debt after `rebrand: replace all Twenty branding with Fuse across frontend and server`.

## Assets

- [ ] Replace placeholder logo SVGs with final approved brand assets:
  - `packages/twenty-front/public/images/integrations/fuse-logo.svg`
  - `packages/twenty-front/public/images/integrations/fuse-logo-dark.svg`
  - `packages/twenty-front/public/images/icons/fuse-favicon.svg`
- [ ] Add `packages/twenty-front/public/images/fuse-social-card.png` (1200x630) for OpenGraph/Twitter previews.
- [ ] Replace legacy Android/iOS PWA icon PNGs in `packages/twenty-front/public/images/icons/`.

## Remaining User-Facing Strings To Review

- [ ] `packages/twenty-front/src/pages/auth/SignInUp.tsx` (`Welcome to Twenty`)
- [ ] `packages/twenty-front/src/pages/not-found/NotFound.tsx` (`Page Not Found | Twenty`)
- [ ] `packages/twenty-front/src/pages/onboarding/SyncEmails.tsx` (sync copy references Twenty)
- [ ] `packages/twenty-front/src/pages/settings/ai/SettingsAIPrompts.tsx` (`managed by Twenty`)
- [ ] `packages/twenty-front/src/modules/auth/sign-in-up/components/FooterNote.tsx` (`By using Twenty...`)
- [ ] `packages/twenty-front/src/modules/activities/timeline-activities/utils/getTimelineActivityAuthorFullName.ts` (`Twenty` fallback)
- [ ] `packages/twenty-front/public/manifest.json` (`name`/`short_name`)

## Notes

- This is branding/product copy debt, not platform reliability debt.
- Keep this separated from infra incident work so outages stay restore-first.
