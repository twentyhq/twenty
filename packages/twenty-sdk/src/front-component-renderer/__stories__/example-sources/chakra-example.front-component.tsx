import { useState } from 'react';
import {
  Box,
  Button,
  ChakraProvider,
  defaultSystem,
  Heading,
  HStack,
  Text,
  VStack,
} from '@chakra-ui/react';
import { defineFrontComponent } from 'twenty-sdk';

export const ChakraComponent = () => {
  const [count, setCount] = useState(0);

  return (
    <ChakraProvider value={defaultSystem}>
      <Box
        data-testid="chakra-component"
        p={6}
        borderWidth="1px"
        borderRadius="lg"
        borderColor="gray.200"
        shadow="sm"
      >
        <VStack gap={3} align="start">
          <Heading size="md" color="teal.600">
            Chakra UI Component
          </Heading>
          <Text fontSize="2xl" fontWeight="bold" data-testid="chakra-count">
            Count: {count}
          </Text>
          <HStack gap={2}>
            <Button
              data-testid="chakra-button"
              colorPalette="teal"
              size="md"
              onClick={() => setCount((previous) => previous + 1)}
            >
              Increment
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => setCount(0)}
            >
              Reset
            </Button>
          </HStack>
        </VStack>
      </Box>
    </ChakraProvider>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  name: 'chakra-component',
  description: 'A front component with Chakra UI',
  component: ChakraComponent,
});
