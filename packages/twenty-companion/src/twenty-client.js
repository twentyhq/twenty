const axios = require('axios');

const LOG_PREFIX = '[Twenty]';

let configLogged = false;

function getApiUrl() {
  return process.env.TWENTY_API_URL;
}

function getWorkspaceSubdomain() {
  return process.env.TWENTY_WORKSPACE_SUBDOMAIN;
}

function getApiKey() {
  return process.env.TWENTY_API_KEY;
}

function isConfigured() {
  const configured = Boolean(getApiUrl() && getApiKey());

  if (!configLogged) {
    configLogged = true;

    if (!configured) {
      console.log(
        `${LOG_PREFIX} Integration disabled — TWENTY_API_URL or TWENTY_API_KEY not set`,
      );
    } else {
      console.log(
        `${LOG_PREFIX} Integration enabled — ${getApiUrl()}`,
      );
    }
  }

  return configured;
}

function getClient() {
  return axios.create({
    baseURL: `${getApiUrl()}/rest`,
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
    },
    timeout: 10000,
  });
}

function logError(action, error) {
  const status = error.response?.status;
  const body = error.response?.data;

  console.error(
    `${LOG_PREFIX} ${action} failed —`,
    status ? `HTTP ${status}` : error.code || error.message,
    body ? JSON.stringify(body) : '',
  );
}

async function createCallRecording(name) {
  console.log(`${LOG_PREFIX} Creating callRecording: "${name}"`);

  const client = getClient();

  try {
    const response = await client.post('/callRecordings', {
      name,
      createdAt: new Date().toISOString(),
    });
    const record = response.data?.data?.createCallRecording;

    console.log(
      `${LOG_PREFIX} callRecording created — id=${record?.id}`,
    );

    return record;
  } catch (error) {
    logError('createCallRecording', error);
    throw error;
  }
}

async function endCallRecording({ callRecordingId, audioUrl, transcriptUrl, participants, localTranscript }) {
  console.log(
    `${LOG_PREFIX} Ending callRecording ${callRecordingId} — audioUrl=${audioUrl} transcriptUrl=${transcriptUrl || 'none'} participants=${participants?.length || 0} localTranscriptEntries=${localTranscript?.length || 0}`,
  );

  try {
    const apiUrl = new URL(getApiUrl());
    const subdomain = getWorkspaceSubdomain();
    const host = subdomain
      ? `${subdomain}.${apiUrl.hostname}:${apiUrl.port}`
      : apiUrl.host;

    const response = await axios.post(
      `${getApiUrl()}/s/end-recording`,
      { callRecordingId, audioUrl, transcriptUrl, participants, localTranscript },
      {
        headers: {
          'Content-Type': 'application/json',
          Host: host,
        },
        timeout: 30000,
      },
    );

    console.log(
      `${LOG_PREFIX} callRecording ended — id=${callRecordingId}`,
    );

    return response.data;
  } catch (error) {
    logError('endCallRecording', error);
    throw error;
  }
}

module.exports = { isConfigured, createCallRecording, endCallRecording };
