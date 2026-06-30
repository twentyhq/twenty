export const buildRegistryCdnUrl = (params: {
  cdnBaseUrl: string;
  packageName: string;
  version: string;
  filePath: string;
}): string => {
  return `${params.cdnBaseUrl}/${params.packageName}@${params.version}/${params.filePath}`;
};
