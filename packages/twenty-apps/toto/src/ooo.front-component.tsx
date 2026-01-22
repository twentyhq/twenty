import { defineFrontComponent } from 'twenty-sdk';

// React component - implement your UI here
const Component = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>My new component!</h1>
      <p>This is your front component: ooo</p>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: '45d4904e-c6a9-4b40-9d91-07df6b7f7d5e',
  name: 'ooo',
  description: 'Add a description for your front component',
  component: Component,
});
