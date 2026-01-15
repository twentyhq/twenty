declare module 'tar-fs' {
  import type { Readable, Writable } from 'stream';

  interface PackOptions {
    entries?: string[];
    filter?: (name: string) => boolean;
    dmode?: number;
    fmode?: number;
    strict?: boolean;
    dereference?: boolean;
    map?: (header: { name: string; [key: string]: unknown }) => {
      name: string;
      [key: string]: unknown;
    };
    mapStream?: (
      fileStream: Readable,
      header: { name: string; [key: string]: unknown },
    ) => Readable;
    finalize?: boolean;
    finish?: (pack: Readable) => void;
  }

  interface ExtractOptions {
    ignore?: (name: string, header?: { [key: string]: unknown }) => boolean;
    filter?: (name: string, header?: { [key: string]: unknown }) => boolean;
    map?: (header: { name: string; [key: string]: unknown }) => {
      name: string;
      [key: string]: unknown;
    };
    mapStream?: (
      fileStream: Readable,
      header: { name: string; [key: string]: unknown },
    ) => Readable;
    dmode?: number;
    fmode?: number;
    strict?: boolean;
  }

  export function pack(
    directory: string,
    options?: PackOptions,
  ): Readable;

  export function extract(
    directory: string,
    options?: ExtractOptions,
  ): Writable;
}
