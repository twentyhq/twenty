const requestDb = async (query: string) => {
  const { apiKey } = await chrome.storage.local.get('apiKey');

  const options = {
    method: 'POST',
    body: JSON.stringify({ query }),
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
  };

  // const response = await fetch(`${process.env.SERVER_BASE_URL}/graphql`, options);
  const response = await fetch(`http://localhost:3000/graphql`, options);

  if (!response.ok) {
    console.error(response);
  }

  return await response.json();
};

export default requestDb;
