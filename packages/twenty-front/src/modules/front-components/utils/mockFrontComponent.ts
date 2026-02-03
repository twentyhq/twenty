import { isDefined } from 'twenty-shared/utils';

const mockFrontComponentCode = `
const { jsx } = globalThis;
const { TwentyUiButton } = globalThis.RemoteComponents;

export default jsx(TwentyUiButton, {
  variant: 'primary',
  disabled: false,
  fullWidth: false,
  onClick: () => {
    console.log('Button clicked');
  },
  title: 'Click me',
});
`;

let cachedMockBlobUrl: string | null = null;

export const getMockFrontComponentUrl = (): string => {
  if (isDefined(cachedMockBlobUrl)) {
    return cachedMockBlobUrl;
  }

  const blob = new Blob([mockFrontComponentCode], {
    type: 'application/javascript',
  });
  cachedMockBlobUrl = URL.createObjectURL(blob);

  return cachedMockBlobUrl;
};
