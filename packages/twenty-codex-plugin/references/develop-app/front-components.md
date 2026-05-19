# Front Components

Use this reference for Twenty app front component source files, registration, data access, Twenty UI imports, runtime imports, and browser verification.

Use `layout.md` for placing a front component in a page layout. Use `standalone-pages.md` for full-page custom UI rendered through a front component widget. Use `../design/front-component-ui.md` for visual design, spacing, states, and polish. Use `app-structure.md` for the develop-app validation checklist and `../manage-app/cli-and-sync.md` for command behavior or troubleshooting.

## Source And Registration

By convention, keep front components under `src/front-components/`, often as `<name>.front-component.tsx`.

Register the component with `defineFrontComponent`:

```tsx
import { defineFrontComponent } from 'twenty-sdk/define';

const MyFrontComponent = () => {
  return <div />;
};

export default defineFrontComponent({
  universalIdentifier: '<front-component-uuid>',
  name: '<front-component-name>',
  description: '<short description>',
  component: MyFrontComponent,
});
```

Do not import or call `react-dom/client` in the component source. The SDK renderer mounts front components.

## Runtime Imports

Keep imports narrow:

- Use `twenty-sdk/front-component` for front component hooks and host APIs.
- Use `twenty-client-sdk/core` or `twenty-client-sdk/metadata` for data access.
- Use `twenty-sdk/ui` for Twenty UI components, icons, and theme tokens before adding external UI libraries.
- Do not import from `twenty-ui` directly. Use the SDK re-export so build aliases and runtime packaging stay aligned.

The front component renderer provides a Twenty `ThemeProvider` around the remote root. For isolated examples or local story-style verification, wrapping the component in `ThemeProvider` from `twenty-sdk/ui` is also acceptable.

The canonical Twenty UI front component example is `packages/twenty-front-component-renderer/src/__stories__/example-sources/twenty-ui-example.front-component.tsx`. It imports `Button`, `Chip`, `H2Title`, `Status`, `Tag`, and `ThemeProvider` from `twenty-sdk/ui`.

When using `themeCssVariables`, compute styles inside the component body or a function called by the component. The SDK mocks `twenty-sdk/ui` during manifest extraction, so module-level constants that dereference `themeCssVariables` can fail before the component renders.

Prefer Twenty UI icons from `twenty-sdk/ui` when one exists. Use inline SVG only for app-specific marks or icons that are not available through the SDK export.

## Record Context And Data

For record-page components, read selection from front component context:

- Use `useSelectedRecordIds()` for single, bulk, or empty selection; derive one id only when the array length is 1.

Use the generated or core Twenty client for reads and writes. Keep loading, empty, error, disabled, and saving states explicit so runtime failures are visible and recoverable.

## Runtime Verification

A clean typecheck and sync is not runtime verification. After the standard validation in `app-structure.md`, open the relevant Twenty surface and confirm:

- The widget mounts without a `FrontComponent error` in the widget body or toast.
- The component renders loading, empty, and error states correctly.
- The main user action works against a real record.
- The page still renders after a hard refresh.
