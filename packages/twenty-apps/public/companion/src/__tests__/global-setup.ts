export const setup = async () => {
  const apiUrl = process.env.TWENTY_API_URL;
  if (!apiUrl || !process.env.TWENTY_API_KEY) {
    throw new Error(
      'Set TWENTY_API_URL and TWENTY_API_KEY for a workspace with Companion installed.',
    );
  }
  const response = await fetch(`${apiUrl}/healthz`);
  if (!response.ok) throw new Error(`Twenty returned HTTP ${response.status}`);
};
