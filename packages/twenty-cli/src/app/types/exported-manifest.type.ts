export type ExportedManifest = Record<string, unknown> & {
  application: Record<string, unknown> & { universalIdentifier: string };
};
