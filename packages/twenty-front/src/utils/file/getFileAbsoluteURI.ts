import { REACT_APP_SERVER_BASE_URL } from '~/config';

export const getFileAbsoluteURI = (fileUrl?: string) => {
  return `${REACT_APP_SERVER_BASE_URL}/files/${fileUrl}`;
};
