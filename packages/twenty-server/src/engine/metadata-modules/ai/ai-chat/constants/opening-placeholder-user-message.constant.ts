import { type UserModelMessage } from 'ai';

export const OPENING_PLACEHOLDER_USER_MESSAGE: UserModelMessage = {
  role: 'user',
  content: '[The user has not written anything yet.]',
};
