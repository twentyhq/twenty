commit 7a2e397ad14d56260f9f3460f49a252efce9f00c
Author: Charles Bochet <charlesBochet@users.noreply.github.com>
Date:   Wed Mar 4 00:50:06 2026 +0100

    Complete linaria migration (#18361)
    
    ## Summary
    
    Completes the migration of the frontend styling system from **Emotion**
    (`@emotion/styled`, `@emotion/react`) to **Linaria** (`@linaria/react`,
    `@linaria/core`), a zero-runtime CSS-in-JS library where styles are
    extracted at build time.
    
    This is the final step of the migration — all ~494 files across
    `twenty-front`, `twenty-ui`, `twenty-website`, and `twenty-sdk` are now
    fully converted.
    
    ## Changes
    
    ### Styling Migration (across ~480 component files)
    - Replaced all `@emotion/styled` imports with `@linaria/react`
    - Converted runtime theme access patterns (`({ theme }) => theme.x.y`)
    to build-time `themeCssVariables` CSS custom properties
    - Replaced `useTheme()` hook (from Emotion) with
    `useContext(ThemeContext)` where runtime theme values are still needed
    (e.g., passing colors to non-CSS props like icon components)
    - Removed `@emotion/react` `css` helper usages in favor of Linaria
    template literals
    
    ### Dependency & Configuration Changes
    - **Removed**: `@emotion/react`, `@emotion/styled` from root
    `package.json`
    - **Added**: `@wyw-in-js/babel-preset`, `next-with-linaria` (for
    twenty-website SSR support)
    - Updated Nx generator defaults from `@emotion/styled` to
    `@linaria/react` in `nx.json`
    - Simplified `vite.config.ts` (removed Emotion-specific configuration)
    - Updated `twenty-website/next.config.js` to use `next-with-linaria` for
    SSR Linaria support
    
    ### Storybook & Testing
    - Removed `ThemeProvider` from Emotion in Storybook previews
    (`twenty-front`, `twenty-sdk`)
    - Now relies solely on `ThemeContextProvider` for theme injection
    
    ### Documentation
    - Removed the temporary `docs/emotion-to-linaria-migration-plan.md`
    (migration complete)
    - Updated `CLAUDE.md` and `README.md` to reflect Linaria as the styling
    stack
    - Updated frontend style guide docs across all locales
    
    ## How it works
    
    Linaria extracts styles at build time via the `@wyw-in-js/vite` plugin.
    All expressions in `styled` template literals must be **statically
    evaluable** — no runtime theme objects or closures over component state.
    
    - **Static styles** use `themeCssVariables` which map to CSS custom
    properties (`var(--theme-color-x)`)
    - **Runtime theme access** (for non-CSS use cases like icon `color`
    props) uses `useContext(ThemeContext)` instead of Emotion's `useTheme()`

diff --git a/packages/twenty-front/src/modules/object-record/record-field/ui/form-types/components/FormBooleanFieldToggleInput.tsx b/packages/twenty-front/src/modules/object-record/record-field/ui/form-types/components/FormBooleanFieldToggleInput.tsx
index 2619b6dbcd..4e829ba050 100644
--- a/packages/twenty-front/src/modules/object-record/record-field/ui/form-types/components/FormBooleanFieldToggleInput.tsx
+++ b/packages/twenty-front/src/modules/object-record/record-field/ui/form-types/components/FormBooleanFieldToggleInput.tsx
@@ -3,9 +3,10 @@ import { FormFieldInputInnerContainer } from '@/object-record/record-field/ui/fo
 import { FormFieldInputRowContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputRowContainer';
 import { InputHint } from '@/ui/input/components/InputHint';
 import { InputLabel } from '@/ui/input/components/InputLabel';
-import styled from '@emotion/styled';
+import { styled } from '@linaria/react';
 import { useId } from 'react';
 import { Toggle } from 'twenty-ui/input';
+import { themeCssVariables } from 'twenty-ui/theme-constants';
 
 type FormBooleanFieldToggleInputProps = {
   label?: string;
@@ -18,10 +19,10 @@ type FormBooleanFieldToggleInputProps = {
 
 const StyledDescription = styled.span`
   align-items: center;
-  color: ${({ theme }) => theme.font.color.secondary};
+  color: ${themeCssVariables.font.color.secondary};
   display: flex;
-  font-size: ${({ theme }) => theme.font.size.md};
-  padding-left: ${({ theme }) => theme.spacing(2)};
+  font-size: ${themeCssVariables.font.size.md};
+  padding-left: ${themeCssVariables.spacing[2]};
   white-space: nowrap;
   overflow: hidden;
   text-overflow: ellipsis;
@@ -29,14 +30,14 @@ const StyledDescription = styled.span`
 
 const StyledToggleContainer = styled.div`
   align-items: center;
-  background-color: ${({ theme }) => theme.background.transparent.lighter};
-  border-top: 1px solid ${({ theme }) => theme.border.color.medium};
-  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
-  border-right: 1px solid ${({ theme }) => theme.border.color.medium};
-  border-bottom-right-radius: ${({ theme }) => theme.border.radius.sm};
-  border-top-right-radius: ${({ theme }) => theme.border.radius.sm};
+  background-color: ${themeCssVariables.background.transparent.lighter};
+  border-top: 1px solid ${themeCssVariables.border.color.medium};
+  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
+  border-right: 1px solid ${themeCssVariables.border.color.medium};
+  border-bottom-right-radius: ${themeCssVariables.border.radius.sm};
+  border-top-right-radius: ${themeCssVariables.border.radius.sm};
   display: flex;
-  padding-right: ${({ theme }) => theme.spacing(2)};
+  padding-right: ${themeCssVariables.spacing[2]};
 `;
 
 export const FormBooleanFieldToggleInput = ({
