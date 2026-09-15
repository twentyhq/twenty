import axios, { type AxiosInstance } from 'axios';
import {
  GOOGLE_TASKS_BASE_API_URL,
  GOOGLE_TASKS_REQUEST_TIMEOUT_MS,
} from 'src/constants/sync';

export const createGoogleTasksClient = (accessToken: string): AxiosInstance =>
  axios.create({
    baseURL: GOOGLE_TASKS_BASE_API_URL,
    timeout: GOOGLE_TASKS_REQUEST_TIMEOUT_MS,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
