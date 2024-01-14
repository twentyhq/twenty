const requestDb = async (query: string) => {
  const { apiKey } = await chrome.storage.local.get('apiKey');
  const { serverBaseUrl } = await chrome.storage.local.get('serverBaseUrl');

  const options = {
    method: 'POST',
    body: JSON.stringify({ query }),
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
  };

  const response = await fetch(
    `${
      serverBaseUrl ? serverBaseUrl : import.meta.env.VITE_SERVER_BASE_URL
    }/graphql`,
    options,
  );

  if (!response.ok) {
    console.error(response);
  }

  return await response.json();
};

export default requestDb;
