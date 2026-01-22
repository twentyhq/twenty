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
  universalIdentifier: '28e63638-1075-4e01-b7cd-b37790fe3bc1',
  name: 'hello-world-front-component',
  description: 'A sample front component',
  component: HelloWorld,
});
