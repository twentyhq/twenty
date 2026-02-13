import { Button, ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { defineFrontComponent } from 'twenty-sdk';

export const ChakraComponent = () => {
  return (
    <ChakraProvider value={defaultSystem}>
      <div style={{ padding: '20px' }}>
        <Button colorPalette="blue" size="md">
          Click me
        </Button>
      </div>
    </ChakraProvider>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  name: 'chakra-component',
  description: 'A front component with a Chakra UI button',
  component: ChakraComponent,
});
