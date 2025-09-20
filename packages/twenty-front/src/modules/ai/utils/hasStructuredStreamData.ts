export const hasStructuredStreamData = (data: string): boolean => {
  if (!data.includes('\n')) {
    return false;
  }

  return data.split('\n').some((line) => {
    try {
      JSON.parse(line);
      return true;
    } catch {
      return false;
    }
  });
};
