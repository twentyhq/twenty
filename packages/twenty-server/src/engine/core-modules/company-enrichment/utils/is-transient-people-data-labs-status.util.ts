export const isTransientPeopleDataLabsStatus = (status: number): boolean =>
  status === 408 || status === 429 || status >= 500;
