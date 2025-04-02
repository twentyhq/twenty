#!/usr/bin/env node

const axios = require('axios');

const API_URL = 'http://localhost:3000/graphql';

// Get the admin token from the command line arguments or environment
const token = process.argv[2] || process.env.ADMIN_TOKEN;

if (!token) {
  console.error(
    'Please provide an admin token as the first argument or set ADMIN_TOKEN environment variable',
  );
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
};

// Function to query the config cache info
const getConfigCacheInfo = async () => {
  const query = `
    query {
      configCacheInfo
    }
  `;

  try {
    const response = await axios.post(API_URL, { query }, { headers });

    return response.data.data.configCacheInfo;
  } catch (error) {
    console.error(
      'GraphQL Errors:',
      error.response?.data?.errors || error.message,
    );
    return null;
  }
};

// Function to update a config var
const updateConfigVar = async (key, value) => {
  const mutation = `
    mutation UpdateConfigVar($input: UpdateConfigVarInput!) {
      updateConfigVar(input: $input) {
        key
        value
        source
      }
    }
  `;

  const variables = {
    input: {
      key,
      value,
    },
  };

  try {
    const response = await axios.post(
      API_URL,
      { query: mutation, variables },
      { headers },
    );

    return response.data.data.updateConfigVar;
  } catch (error) {
    console.error(
      'GraphQL Errors:',
      error.response?.data?.errors || error.message,
    );
    return null;
  }
};

// Function to get all config vars
const getAllConfigVars = async () => {
  const query = `
    query {
      configVars {
        key
        value
        source
      }
    }
  `;

  try {
    const response = await axios.post(API_URL, { query }, { headers });

    return response.data.data.configVars;
  } catch (error) {
    console.error(
      'GraphQL Errors:',
      error.response?.data?.errors || error.message,
    );
    return null;
  }
};

// Main function to run tests
const main = async () => {
  console.log('Testing configuration cache...');

  // Check initial cache state
  console.log('\n1. Initial cache state:');
  const initialCache = await getConfigCacheInfo();
  console.log(JSON.stringify(initialCache, null, 2));

  // Get all config vars
  console.log('\n2. Fetching all config vars to generate cache activity:');
  const allVars = await getAllConfigVars();
  console.log(`Fetched ${allVars?.length || 0} configuration variables`);

  // Check cache state after getting all vars
  console.log('\n3. Cache state after fetching all vars:');
  const cacheAfterFetch = await getConfigCacheInfo();
  console.log(JSON.stringify(cacheAfterFetch, null, 2));

  // Update a test config var
  const testKey = 'TELEMETRY_ENABLED';
  const testValue = 'false';
  console.log(`\n4. Updating config var ${testKey}=${testValue}:`);
  const updateResult = await updateConfigVar(testKey, testValue);
  console.log('Update result:', updateResult);

  // Check cache state after update
  console.log('\n5. Cache state after update:');
  const cacheAfterUpdate = await getConfigCacheInfo();
  console.log(JSON.stringify(cacheAfterUpdate, null, 2));

  // Reset the test config var
  const resetValue = 'true';
  console.log(`\n6. Resetting config var ${testKey}=${resetValue}:`);
  const resetResult = await updateConfigVar(testKey, resetValue);
  console.log('Reset result:', resetResult);

  console.log('\n7. Final cache state:');
  const finalCache = await getConfigCacheInfo();
  console.log(JSON.stringify(finalCache, null, 2));

  console.log('\nTest completed!');
};

main().catch((error) => {
  console.error('Error during test:', error);
  process.exit(1);
});
