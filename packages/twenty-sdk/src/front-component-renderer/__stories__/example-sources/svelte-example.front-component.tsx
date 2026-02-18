import { defineFrontComponent } from '@/sdk';

// @ts-expect-error -- esbuild-svelte handles .svelte imports at build time
import SvelteCounter from './svelte-counter.svelte';

const SvelteExampleComponent = (container: HTMLElement) => {
  const component = new SvelteCounter({ target: container });

  return () => component.$destroy();
};

export default defineFrontComponent({
  universalIdentifier: 'test-svel-00000000-0000-0000-0000-000000000011',
  name: 'svelte-example',
  description: 'A Svelte framework front component example',
  framework: 'svelte',
  component: SvelteExampleComponent,
});
