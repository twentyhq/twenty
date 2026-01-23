import kebabCase from 'lodash.kebabcase';
import { v4 } from 'uuid';

export const getFrontComponentBaseFile = ({
  name,
  universalIdentifier = v4(),
}: {
  name: string;
  universalIdentifier?: string;
}) => {
  const kebabCaseName = kebabCase(name);

  return `import { defineFrontComponent } from 'twenty-sdk';

// React component - implement your UI here
const Component = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>My new component!</h1>
      <p>This is your front component: ${kebabCaseName}</p>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: '${universalIdentifier}',
  name: '${kebabCaseName}',
  description: 'Add a description for your front component',
  component: Component,
});
`;
};
