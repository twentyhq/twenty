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
  universalIdentifier: '26c17445-fbfb-4b34-99d6-f461e734ca97',
  name: 'hello-world-front-component',
  description: 'A sample front component',
  component: HelloWorld,
});
