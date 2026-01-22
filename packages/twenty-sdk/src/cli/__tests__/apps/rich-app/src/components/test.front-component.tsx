import { defineFrontComponent } from '@/application/front-components/define-front-component';
import testLogo from '../assets/test-logo.png';

export const TestComponent = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Test Component</h1>
      <img src={testLogo} alt="Test Logo" />
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'f1234567-abcd-4000-8000-000000000001',
  name: 'test-component',
  description: 'A test front component',
  component: TestComponent,
});
