export const getIsDevelopmentEnvironment = () => {
  return process.env.IS_DEV_ENV === 'true';
};
