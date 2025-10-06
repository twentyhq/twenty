import axios from 'axios';

const TWENTY_API_KEY = '<SET_YOUR_TWENTY_API>';

export const main = async (params: { recipient: string }): Promise<object> => {
  const { recipient } = params;

  const options = {
    method: 'POST',
    url: 'http://localhost:3000/rest/postCards',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TWENTY_API_KEY}`,
    },
    data: { name: recipient ?? 'Unknown' },
  };

  try {
    const { data } = await axios.request(options);

    console.log(`New post card to "${recipient}" created`);

    return { data };
  } catch (error) {
    console.error(error);
  }
};
