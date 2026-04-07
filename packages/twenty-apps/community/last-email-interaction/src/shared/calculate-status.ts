export const calculateStatus = (date: string) => {
  const day = 1000 * 60 * 60 * 24;
  const now = Date.now();
  const messageDate = Date.parse(date);
  const deltaTime = now - messageDate;
  return deltaTime < 7 * day
    ? 'RECENT'
    : deltaTime < 30 * day
    ? 'ACTIVE'
    : deltaTime < 90 * day
    ? 'COOLING'
    : 'DORMANT';
};