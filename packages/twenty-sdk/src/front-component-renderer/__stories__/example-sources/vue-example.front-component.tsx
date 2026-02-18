import { createApp, defineComponent, h, ref } from 'vue';

import { defineFrontComponent } from '@/sdk';

const VueCounter = defineComponent({
  setup: () => {
    const count = ref(0);

    return () =>
      h(
        'div',
        {
          'data-testid': 'vue-component',
          style: {
            padding: '24px',
            backgroundColor: '#f0fdf4',
            border: '2px solid #4ade80',
            borderRadius: '12px',
            fontFamily: 'system-ui, sans-serif',
          },
        },
        [
          h(
            'h2',
            {
              style: {
                color: '#166534',
                fontWeight: '700',
                fontSize: '18px',
                marginBottom: '12px',
              },
            },
            'Vue Component',
          ),
          h(
            'span',
            {
              style: {
                display: 'inline-block',
                padding: '2px 8px',
                backgroundColor: '#4ade80',
                color: 'white',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '600',
                marginBottom: '16px',
              },
            },
            'vue',
          ),
          h('br'),
          h(
            'p',
            {
              'data-testid': 'vue-count',
              style: {
                fontSize: '28px',
                fontWeight: '800',
                color: '#15803d',
                marginBottom: '16px',
              },
            },
            `Count: ${count.value}`,
          ),
          h(
            'button',
            {
              'data-testid': 'vue-button',
              onClick: () => count.value++,
              style: {
                padding: '10px 20px',
                backgroundColor: '#22c55e',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                cursor: 'pointer',
              },
            },
            'Increment',
          ),
        ],
      );
  },
});

const VueExampleComponent = (container: HTMLElement) => {
  const app = createApp(VueCounter);

  app.mount(container);

  return () => app.unmount();
};

export default defineFrontComponent({
  universalIdentifier: 'test-vue0-00000000-0000-0000-0000-000000000010',
  name: 'vue-example',
  description: 'A Vue framework front component example',
  framework: 'vue',
  component: VueExampleComponent,
});
