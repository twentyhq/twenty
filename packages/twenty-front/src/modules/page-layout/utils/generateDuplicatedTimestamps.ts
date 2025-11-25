export const generateDuplicatedTimestamps = (): {
  createdAt: string;
  updatedAt: string;
} => {
  const now = new Date().toISOString();

  return {
    createdAt: now,
    updatedAt: now,
  };
};
