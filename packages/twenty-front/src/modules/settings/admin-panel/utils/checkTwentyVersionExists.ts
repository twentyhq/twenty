export const checkTwentyVersionExists = async (
  version: string,
): Promise<boolean> => {
  try {
    const response = await fetch(
      `https://api.github.com/repos/twentyhq/twenty/releases/tags/v${version}`,
    );
    return response.status === 200;
  } catch (error) {
    return false;
  }
};
