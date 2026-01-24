import { defineFrontComponent } from '@/application/front-components/define-front-component';

export const RootComponent = () => {
  return (
    <div style={{ padding: '10px' }}>
      <h2>Root Component</h2>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'a0a1a2a3-a4a5-4000-8000-000000000001',
  name: 'root-component',
  description: 'A root-level front component',
  component: RootComponent,
});
