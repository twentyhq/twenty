export type ExportedManifest = Record<string, unknown> & {
  publicAssets?: { filePath: string }[] | null;
  application: Record<string, unknown> & { universalIdentifier: string };
};
