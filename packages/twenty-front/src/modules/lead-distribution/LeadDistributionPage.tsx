import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'react-query';
import {
  Button,
  Card,
  Container,
  FormControl,
  FormLabel,
  Input,
  Select,
  Stack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
} from '@chakra-ui/react';

const fetchLeadDistributionConfig = async () => {
  const res = await fetch('/api/lead-distribution/config');
  return res.json();
};

const setLeadDistributionConfig = async (config) => {
  const res = await fetch('/api/lead-distribution/config', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(config),
  });
  return res.json();
};

const LeadDistributionPage = () => {
  const toast = useToast();
  const { data: config, isLoading } = useQuery('leadDistributionConfig', fetchLeadDistributionConfig);
  const mutation = useMutation(setLeadDistributionConfig, {
    onSuccess: () => {
      toast({
        title: 'Configuration saved.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const [distributionType, setDistributionType] = useState('round-robin');
  const [weights, setWeights] = useState({});

  useEffect(() => {
    if (config) {
      setDistributionType(config.type);
      setWeights(config.weights || {});
    }
  }, [config]);

  const handleSave = () => {
    mutation.mutate({ type: distributionType, weights });
  };

  const handleWeightChange = (agentId, weight) => {
    setWeights({ ...weights, [agentId]: parseInt(weight, 10) });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Container maxW="container.xl" py={10}>
      <Stack spacing={8}>
        <Card p={5}>
          <FormControl>
            <FormLabel>Distribution Type</FormLabel>
            <Select value={distributionType} onChange={(e) => setDistributionType(e.target.value)}>
              <option value="round-robin">Round Robin</option>
              <option value="weighted">Weighted Round Robin</option>
            </Select>
          </FormControl>
        </Card>

        {distributionType === 'weighted' && (
          <Card p={5}>
            <Table>
              <Thead>
                <Tr>
                  <Th>Agent</Th>
                  <Th>Weight</Th>
                </Tr>
              </Thead>
              <Tbody>
                {/* This is a placeholder for the agents list. In a real application, you would fetch the agents from the API. */}
                <Tr>
                  <Td>Agent 1</Td>
                  <Td>
                    <Input
                      type="number"
                      value={weights['agent1'] || ''}
                      onChange={(e) => handleWeightChange('agent1', e.target.value)}
                    />
                  </Td>
                </Tr>
                <Tr>
                  <Td>Agent 2</Td>
                  <Td>
                    <Input
                      type="number"
                      value={weights['agent2'] || ''}
                      onChange={(e) => handleWeightChange('agent2', e.target.value)}
                    />
                  </Td>
                </Tr>
              </Tbody>
            </Table>
          </Card>
        )}

        <Button colorScheme="blue" onClick={handleSave}>
          Save
        </Button>
      </Stack>
    </Container>
  );
};

export default LeadDistributionPage;
