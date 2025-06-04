export const generateRandomCode = () =>
  (Math.random() + 1).toString(36).substring(2);
