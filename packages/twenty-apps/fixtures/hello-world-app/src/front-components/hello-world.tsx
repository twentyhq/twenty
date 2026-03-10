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
  universalIdentifier: 'd371f098-5b2c-42f0-898d-94459f1ee337',
  name: 'hello-world-front-component',
  description: 'A sample front component',
  component: HelloWorld,
});
