import { defineFrontComponent } from '@/application/front-components/define-front-component';

export const TestComponent = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Test Component</h1>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'f1234567-abcd-4000-8000-000000000001',
  name: 'test-component',
  description: 'A test front component',
  component: TestComponent,
});
