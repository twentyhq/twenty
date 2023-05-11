import jwt from 'jwt-decode';

export const hasAccessToken = () => {
  const accessToken = localStorage.getItem('accessToken');

  return accessToken ? true : false;
};

export const getUserIdFromToken = () => {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    return null;
  }

  return jwt<{ sub: string }>(accessToken).sub;
};

export const hasRefreshToken = () => {
  const refreshToken = localStorage.getItem('refreshToken');

  return refreshToken ? true : false;
};

export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    localStorage.removeItem('accessToken');
  }

  const response = await fetch(
    process.env.REACT_APP_AUTH_URL + '/token' || '',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    },
  );

  if (response.ok) {
    const { accessToken } = await response.json();
    localStorage.setItem('accessToken', accessToken);
  } else {
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('accessToken');
  }
};
