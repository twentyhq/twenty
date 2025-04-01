export const fetchLatestTwentyRelease = async (): Promise<string> => {
  try {
    const response = await fetch(
      'https://api.github.com/repos/twentyhq/twenty/releases/latest',
    );
    const data = await response.json();
    return data.tag_name.replace('v', '');
  } catch (error) {
    return 'Could not fetch latest release';
  }
};
