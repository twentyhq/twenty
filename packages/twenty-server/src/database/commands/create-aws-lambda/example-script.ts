import axios from 'axios';

export class MyCustomService {
  async handle() {
    try {
      const response = await axios.get(
        'https://jsonplaceholder.typicode.com/posts',
      );

      return response.data;
    } catch (error: any) {
      return error;
    }
  }
}
