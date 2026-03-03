commit 3bfdc2c83f0ab79dc6c7e5edd4389fa0d74bc3c9
Author: Charles Bochet <charlesBochet@users.noreply.github.com>
Date:   Tue Mar 3 16:42:03 2026 +0100

    chore(twenty-front): migrate command-menu, workflow, page-layout and UI modules from Emotion to Linaria (PR 4-6/10) (#18342)
    
    ## Summary
    
    Continues the Emotion → Linaria migration (PR 4-6 from the [migration
    plan](docs/emotion-to-linaria-migration-plan.md)). Migrates **311
    files** across four module groups:
    
    | Module | Files |
    |---|---|
    | command-menu | 53 |
    | workflow | 84 |
    | page-layout | 84 |
    | UI (partial - first ~80 files) | ~80 |
    | twenty-ui (TEXT_INPUT_STYLE) | 1 |
    | misc (hooks, keyboard-shortcut-menu, file-upload) | ~9 |
    
    ### Migration patterns applied
    
    - `import styled from '@emotion/styled'` → `import { styled } from
    '@linaria/react'`
    - `import { useTheme } from '@emotion/react'` → `import { useContext }
    from 'react'` + `import { ThemeContext } from 'twenty-ui/theme'`
    - `${({ theme }) => theme.X.Y.Z}` → `${themeCssVariables.X.Y.Z}` (static
    CSS variables)
    - `theme.spacing(N)` → `themeCssVariables.spacing[N]`
    - `styled(motion.div)` → `motion.create(StyledBase)` (11 components)
    - `styled(Component)<TypeParams>` → wrapper div approach for non-HTML
    elements
    - Multi-declaration interpolations split into one CSS property per
    interpolation
    - Interpolation return types fixed (`&&` → ternary `? : ''`)
    - `TEXT_INPUT_STYLE` converted from function to static string constant
    (backward compatible)
    - Emotion `<Global>` replaced with `useEffect` style injection
    - Complex runtime-dependent styles use CSS custom properties via
    `style={}` prop
    
    ### After this PR
    
    - **Remaining files**: ~400 (object-record: ~160, settings: ~200, UI:
    ~44)
    - **No breaking changes**: CSS variables resolve identically to the
    previous Emotion theme values

diff --git a/packages/twenty-front/src/modules/page-layout/widgets/fields/components/FieldsConfigurationGroupRenameInput.tsx b/packages/twenty-front/src/modules/page-layout/widgets/fields/components/FieldsConfigurationGroupRenameInput.tsx
index bb7ebd73dc..543ae8f26d 100644
--- a/packages/twenty-front/src/modules/page-layout/widgets/fields/components/FieldsConfigurationGroupRenameInput.tsx
+++ b/packages/twenty-front/src/modules/page-layout/widgets/fields/components/FieldsConfigurationGroupRenameInput.tsx
@@ -1,16 +1,17 @@
-import styled from '@emotion/styled';
+import { styled } from '@linaria/react';
 import { useLingui } from '@lingui/react/macro';
 import { Key } from 'ts-key-enum';
 
 import { TextInput } from '@/ui/input/components/TextInput';
 import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
 import { Button } from 'twenty-ui/input';
+import { themeCssVariables } from 'twenty-ui/theme-constants';
 
 const StyledContainer = styled.div`
   align-items: center;
   display: flex;
-  gap: ${({ theme }) => theme.spacing(1)};
-  padding: ${({ theme }) => theme.spacing(1)};
+  gap: ${themeCssVariables.spacing[1]};
+  padding: ${themeCssVariables.spacing[1]};
   width: 100%;
   box-sizing: border-box;
 `;
