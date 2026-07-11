export const getLogicFunctionHttpUrl = ({
  functionsBaseUrl,
  path,
}: {
  functionsBaseUrl: string;
  path: string;
}): string => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${functionsBaseUrl}${normalizedPath}`;
};
