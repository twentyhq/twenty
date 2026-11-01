import { defineFrontComponent } from 'twenty-sdk/define';

const LAYERED_UTILITIES_CSS = `
@layer theme, base, components, utilities;
@layer base {
  *, ::before, ::after { box-sizing: border-box; margin: 0; padding: 0; }
  button { background-color: transparent; }
}
@layer utilities {
  .px-4 { padding-left: 1rem; padding-right: 1rem; }
  .bg-blue-600 { background-color: #2563eb; }
}
`;

const LayeredUtilitiesComponent = () => (
  <>
    <style>{LAYERED_UTILITIES_CSS}</style>
    <button
      type="button"
      data-testid="layered-utilities-button"
      className="px-4 bg-blue-600"
    >
      Layered utilities
    </button>
  </>
);

export default defineFrontComponent({
  universalIdentifier: 'test-layered-0000-0000-0000-000000000012',
  name: 'layered-utilities-component',
  description: 'A front component whose utility classes live in CSS layers',
  component: LayeredUtilitiesComponent,
});
