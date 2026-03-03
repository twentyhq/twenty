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
  universalIdentifier: 'c48f8251-eed3-480e-9bfe-3e3437a7823e',
  name: 'hello-world-front-component',
  description: 'A sample front component',
  component: HelloWorld,
});
