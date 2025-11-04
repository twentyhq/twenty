export const main = async (params: {
  name: string
}): Promise<object> => {
  const response = await fetch(`${process.env.TWENTY_API_URL}/rest/companies`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.TWENTY_API_KEY}`,
    },
    body: JSON.stringify({
      name: params.name
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return (await response.json()) as object;
};
