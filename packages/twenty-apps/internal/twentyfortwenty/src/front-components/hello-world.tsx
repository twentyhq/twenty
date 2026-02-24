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
  universalIdentifier: 'fdc11610-5a8b-4e22-87e1-e1805d05be69',
  name: 'hello-world-front-component',
  description: 'A sample front component',
  component: HelloWorld,
});
