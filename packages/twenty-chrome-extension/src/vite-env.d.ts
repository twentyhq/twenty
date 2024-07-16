/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SERVER_BASE_URL: string;
  readonly VITE_FRONT_BASE_URL: string;
  readonly VITE_MODE: string;
  readonly AUTH_TOKEN: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
