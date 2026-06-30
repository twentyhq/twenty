export const isTestOrExampleEmail = (email: string): boolean => {
  const normalizedEmail = email.toLowerCase();

  return (
    normalizedEmail.includes('example') || normalizedEmail.includes('test')
  );
};
