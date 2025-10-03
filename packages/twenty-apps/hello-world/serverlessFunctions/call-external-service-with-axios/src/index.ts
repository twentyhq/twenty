import axios from 'axios';

export const main = async (): Promise<object> => {
  const response = await axios.get(
    'https://jsonplaceholder.typicode.com/todos/1',
  );

  console.log('Response from call-external-service-with-axios:', response);

  return { data: response.data };
};
