import { useState } from 'react';
import {
  Badge,
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

const ChakraComponent = () => {
  const [count, setCount] = useState(0);

  return (
    <ChakraProvider value={defaultSystem}>
      <Box
        data-testid="chakra-component"
        p={6}
        borderWidth="2px"
        borderRadius="xl"
        borderColor="teal.400"
        bg="teal.50"
        maxW="360px"
        fontFamily="system-ui, sans-serif"
      >
        <VStack gap={4} align="start">
          <Heading size="md" color="teal.700">
            Chakra UI
          </Heading>
          <Text fontSize="sm" color="teal.600">
            Component library with built-in design tokens and responsive styles.
          </Text>
          <HStack gap={2}>
            <Badge colorPalette="teal" variant="solid">
              Badge
            </Badge>
            <Badge colorPalette="purple" variant="solid">
              Styled
            </Badge>
            <Badge colorPalette="orange" variant="outline">
              Outline
            </Badge>
          </HStack>
          <Text
            data-testid="chakra-count"
            fontSize="2xl"
            fontWeight="bold"
            color="teal.800"
          >
            Count: {count}
          </Text>
          <HStack gap={2}>
            <Button
              data-testid="chakra-button"
              colorPalette="teal"
              size="sm"
              onClick={() => setCount((previous) => previous + 1)}
            >
              Increment
            </Button>
            <Button
              variant="outline"
              size="sm"
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
