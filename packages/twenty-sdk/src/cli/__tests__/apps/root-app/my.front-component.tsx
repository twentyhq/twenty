import { defineFrontComponent } from '@/application/front-components/define-front-component';

export const MyComponent = () => {
  return (
    <div style={{ padding: '10px' }}>
      <h2>My Component</h2>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'e1e2e3e4-e5e6-4000-8000-000000000020',
  name: 'my-component',
  description: 'A root-level front component',
  component: MyComponent,
});
