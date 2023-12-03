import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import env from 'vite-plugin-environment';
import tsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svgr(),
    react(),
    tsconfigPaths(),
    env('all', { prefix: 'REACT_APP_' }),
  ],
  server: {
    port: 3001,
  },
});
