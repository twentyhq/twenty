export const useHasAccessToken = () => {
  const accessToken = localStorage.getItem('accessToken');

  return accessToken ? true : false;
};
