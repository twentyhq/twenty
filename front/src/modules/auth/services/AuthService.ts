import jwt from 'jwt-decode';

export const hasAccessToken = () => {
  const accessToken = localStorage.getItem('accessToken');

  return accessToken ? true : false;
};

export const getUserIdFromToken: () => string | null = () => {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    return null;
  }

  try {
    return jwt<{ sub: string }>(accessToken).sub;
  } catch (error) {
    return null;
  }
};

export const hasRefreshToken = () => {
  const refreshToken = localStorage.getItem('refreshToken');

  return refreshToken ? true : false;
};

export const getTokensFromLoginToken = async (loginToken: string) => {
  if (!loginToken) {
    return;
  }

  const response = await fetch(
    process.env.REACT_APP_AUTH_URL + '/verify' || '',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ loginToken }),
    },
  );

  if (response.ok) {
    const { tokens } = await response.json();
    if (!tokens) {
      return;
    }

    localStorage.setItem('accessToken', tokens.accessToken.token);
    localStorage.setItem('refreshToken', tokens.refreshToken.token);
  } else {
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('accessToken');
  }
};

export const getTokensFromRefreshToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    localStorage.removeItem('accessToken');
    return;
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
    const { tokens } = await response.json();

    if (!tokens) {
      return;
    }
    localStorage.setItem('accessToken', tokens.accessToken.token);
    localStorage.setItem('refreshToken', tokens.refreshToken.token);
  } else {
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('accessToken');
  }
};

export const removeTokens = () => {
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('accessToken');
};
