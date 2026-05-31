# Fork Default Branding Assets

This directory contains the **neutral default icons** used when a workspace has not yet uploaded a custom logo.

## Current Files

- `default-app-icon.svg` — Primary default PWA / app icon (SVG, scalable, easy to edit)
- (Optional) `default-app-icon.png` — Raster fallback for older clients (add this if needed)

## How to Replace for a New Client / New Fork

1. Replace `default-app-icon.svg` with the client's icon.
   - Must be square aspect ratio.
   - Recommended: 192×192 or larger, dark background, high contrast.
   - Keep the filename or update all references (see below).

2. If you also want a PNG version:
   - Add `default-app-icon.png` (192×192 and/or 512×512)
   - Update these two locations:
     - `packages/twenty-front/public/manifest.json`
     - `packages/twenty-server/src/engine/core-modules/workspace-branding/utils/generate-workspace-manifest.util.ts`

3. Rebuild the Docker image and deploy.

## Why This Location?

Having a single, well-documented directory (`public/branding/`) makes white-labeling trivial for future forks. No more hunting through `images/icons/android/`, `public/`, or scattered component fallbacks.

See the root `tofu/BRANDING.md` for the complete map of every place branding can leak.

## Current Default Icon

The shipped `default-app-icon.svg` is a minimal dark square with a centered "C" (for "CRM"). It is intentionally generic and carries no Twenty branding.
