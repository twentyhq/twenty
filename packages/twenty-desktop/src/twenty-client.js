const axios = require('axios');

const TWENTY_API_URL = process.env.TWENTY_API_URL;
const TWENTY_API_KEY = process.env.TWENTY_API_KEY;

function isConfigured() {
  return Boolean(TWENTY_API_URL && TWENTY_API_KEY);
}

function getClient() {
  return axios.create({
    baseURL: `${TWENTY_API_URL}/api/rest`,
    headers: {
      Authorization: `Bearer ${TWENTY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    timeout: 10000,
  });
}

async function createCallRecording(name) {
  const client = getClient();

  const response = await client.post('/callRecordings', { name });

  return response.data?.data?.createCallRecording;
}

async function endCallRecording(recordId) {
  const client = getClient();

  const response = await client.patch(`/callRecordings/${recordId}`, {
    endedAt: new Date().toISOString(),
  });

  return response.data?.data?.updateCallRecording;
}

module.exports = { isConfigured, createCallRecording, endCallRecording };
