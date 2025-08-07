export const main = async (params: {
  a: string;
  b: number;
}): Promise<object> => {
  const { a, b } = params;

  // Replace the parameters and code below with your own logic
  // This is just an example
  const message = `Hello, this is input: ${a} and ${b}`;

  return { message };
};
