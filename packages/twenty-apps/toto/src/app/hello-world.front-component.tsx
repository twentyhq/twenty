import { defineFrontComponent } from 'twenty-sdk';

export const HelloWorld = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Hello, World!</h1>
      <p>This is your first front component.</p>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: '3f9e7fcc-c640-48a0-8a9e-e2a4203349e1',
  name: 'hello-world-front-component',
  description: 'A sample front component',
  component: HelloWorld,
});
