// Subset of the npm registry packument response (GET /{packageName}).
// Only the fields we actually use are typed; the full response is much larger.
export type NpmPackument = {
  name: string;
  description?: string;
  readme?: string;
  license?: string;
  repository?: { type?: string; url?: string } | string;
  homepage?: string;
};
