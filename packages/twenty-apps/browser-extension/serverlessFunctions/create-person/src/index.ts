export const main = async (params: {
  firstName: string;
  lastName: string;
}): Promise<object> => {
  const response = await fetch(`${process.env.TWENTY_API_URL}/rest/people`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.TWENTY_API_KEY}`,
    },
    body: JSON.stringify({
      name: {
        firstName: params.firstName,
        lastName: params.lastName,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return (await response.json()) as object;
};
