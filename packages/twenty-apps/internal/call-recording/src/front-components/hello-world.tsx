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
  universalIdentifier: '5c2fd1e8-dd18-4354-9d0e-424beedafde9',
  name: 'hello-world-front-component',
  description: 'A sample front component',
  component: HelloWorld,
});
