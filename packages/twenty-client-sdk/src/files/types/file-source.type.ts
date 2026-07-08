export type FileSource =
  | { url: string }
  | { data: Blob | ArrayBuffer | Uint8Array; contentType?: string };
