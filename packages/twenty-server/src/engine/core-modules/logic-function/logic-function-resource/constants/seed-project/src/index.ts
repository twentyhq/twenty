export const main = async (params: {
  a: string;
  b: number;
}): Promise<object> => {
  const { a, b } = params;

  // Rename the parameters and code below with your own logic
  // This is just an example
  const message = `Hello, input: ${a} and ${b}`;

  return { message };
};
