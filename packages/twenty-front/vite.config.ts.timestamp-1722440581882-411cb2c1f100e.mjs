// packages/twenty-front/vite.config.ts
import react from "file:///Users/lucas/code/twenty/node_modules/@vitejs/plugin-react-swc/index.mjs";
import wyw from "file:///Users/lucas/code/twenty/node_modules/@wyw-in-js/vite/esm/index.mjs";
import path from "path";
import { defineConfig, loadEnv } from "file:///Users/lucas/code/twenty/node_modules/vite/dist/node/index.js";
import checker from "file:///Users/lucas/code/twenty/node_modules/vite-plugin-checker/dist/esm/main.js";
import svgr from "file:///Users/lucas/code/twenty/node_modules/vite-plugin-svgr/dist/index.js";
import tsconfigPaths from "file:///Users/lucas/code/twenty/node_modules/vite-tsconfig-paths/dist/index.mjs";
var __vite_injected_original_dirname = "/Users/lucas/code/twenty/packages/twenty-front";
var vite_config_default = defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const { REACT_APP_SERVER_BASE_URL, VITE_BUILD_SOURCEMAP } = env;
  const isBuildCommand = command === "build";
  const checkers = {
    typescript: {
      tsconfigPath: path.resolve(__vite_injected_original_dirname, "./tsconfig.app.json")
    },
    overlay: false
  };
  if (!isBuildCommand) {
    checkers["eslint"] = {
      lintCommand: "eslint . --report-unused-disable-directives --max-warnings 0 --config .eslintrc.cjs"
    };
  }
  return {
    root: __vite_injected_original_dirname,
    cacheDir: "../../node_modules/.vite/packages/twenty-front",
    server: {
      port: 3001,
      host: "localhost"
    },
    plugins: [
      react({ jsxImportSource: "@emotion/react" }),
      tsconfigPaths({
        projects: ["tsconfig.json", "../twenty-ui/tsconfig.json"]
      }),
      svgr(),
      checker(checkers),
      // TODO: fix this, we have to restrict the include to only the components that are using linaria
      // Otherwise the build will fail because wyw tries to include emotion styled components
      wyw({
        include: [
          "**/CurrencyDisplay.tsx",
          "**/EllipsisDisplay.tsx",
          "**/ContactLink.tsx",
          "**/BooleanDisplay.tsx",
          "**/LinksDisplay.tsx",
          "**/RoundedLink.tsx",
          "**/OverflowingTextWithTooltip.tsx",
          "**/Chip.tsx",
          "**/Tag.tsx",
          "**/MultiSelectFieldDisplay.tsx",
          "**/RatingInput.tsx",
          "**/RecordTableCellContainer.tsx",
          "**/RecordTableCellDisplayContainer.tsx",
          "**/Avatar.tsx",
          "**/RecordTableBodyDroppable.tsx",
          "**/RecordTableCellBaseContainer.tsx",
          "**/RecordTableCellTd.tsx",
          "**/RecordTableTd.tsx",
          "**/RecordTableHeaderDragDropColumn.tsx"
        ],
        babelOptions: {
          presets: ["@babel/preset-typescript", "@babel/preset-react"]
        }
      })
    ],
    build: {
      outDir: "build",
      sourcemap: VITE_BUILD_SOURCEMAP === "true"
    },
    envPrefix: "REACT_APP_",
    define: {
      "process.env": {
        REACT_APP_SERVER_BASE_URL
      }
    },
    css: {
      modules: {
        localsConvention: "camelCaseOnly"
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsicGFja2FnZXMvdHdlbnR5LWZyb250L3ZpdGUuY29uZmlnLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL2x1Y2FzL2NvZGUvdHdlbnR5L3BhY2thZ2VzL3R3ZW50eS1mcm9udFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2x1Y2FzL2NvZGUvdHdlbnR5L3BhY2thZ2VzL3R3ZW50eS1mcm9udC92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvbHVjYXMvY29kZS90d2VudHkvcGFja2FnZXMvdHdlbnR5LWZyb250L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0LXN3Yyc7XG5pbXBvcnQgd3l3IGZyb20gJ0B3eXctaW4tanMvdml0ZSc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IGRlZmluZUNvbmZpZywgbG9hZEVudiB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IGNoZWNrZXIgZnJvbSAndml0ZS1wbHVnaW4tY2hlY2tlcic7XG5pbXBvcnQgc3ZnciBmcm9tICd2aXRlLXBsdWdpbi1zdmdyJztcbmltcG9ydCB0c2NvbmZpZ1BhdGhzIGZyb20gJ3ZpdGUtdHNjb25maWctcGF0aHMnO1xuXG50eXBlIENoZWNrZXJzID0gUGFyYW1ldGVyczx0eXBlb2YgY2hlY2tlcj5bMF07XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgY29tbWFuZCwgbW9kZSB9KSA9PiB7XG4gIGNvbnN0IGVudiA9IGxvYWRFbnYobW9kZSwgcHJvY2Vzcy5jd2QoKSwgJycpO1xuXG4gIC8qXG4gICAgVXNpbmcgZXhwbGljaXQgZW52IHZhcmlhYmxlcywgdGhlcmUgaXMgbm8gbmVlZCB0byBleHBvc2UgYWxsIG9mIHRoZW0gKHNlY3VyaXR5KS5cbiAgKi9cbiAgY29uc3QgeyBSRUFDVF9BUFBfU0VSVkVSX0JBU0VfVVJMLCBWSVRFX0JVSUxEX1NPVVJDRU1BUCB9ID0gZW52O1xuXG4gIGNvbnN0IGlzQnVpbGRDb21tYW5kID0gY29tbWFuZCA9PT0gJ2J1aWxkJztcblxuICBjb25zdCBjaGVja2VyczogQ2hlY2tlcnMgPSB7XG4gICAgdHlwZXNjcmlwdDoge1xuICAgICAgdHNjb25maWdQYXRoOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi90c2NvbmZpZy5hcHAuanNvbicpLFxuICAgIH0sXG4gICAgb3ZlcmxheTogZmFsc2UsXG4gIH07XG5cbiAgaWYgKCFpc0J1aWxkQ29tbWFuZCkge1xuICAgIGNoZWNrZXJzWydlc2xpbnQnXSA9IHtcbiAgICAgIGxpbnRDb21tYW5kOlxuICAgICAgICAnZXNsaW50IC4gLS1yZXBvcnQtdW51c2VkLWRpc2FibGUtZGlyZWN0aXZlcyAtLW1heC13YXJuaW5ncyAwIC0tY29uZmlnIC5lc2xpbnRyYy5janMnLFxuICAgIH07XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHJvb3Q6IF9fZGlybmFtZSxcbiAgICBjYWNoZURpcjogJy4uLy4uL25vZGVfbW9kdWxlcy8udml0ZS9wYWNrYWdlcy90d2VudHktZnJvbnQnLFxuXG4gICAgc2VydmVyOiB7XG4gICAgICBwb3J0OiAzMDAxLFxuICAgICAgaG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgfSxcblxuICAgIHBsdWdpbnM6IFtcbiAgICAgIHJlYWN0KHsganN4SW1wb3J0U291cmNlOiAnQGVtb3Rpb24vcmVhY3QnIH0pLFxuICAgICAgdHNjb25maWdQYXRocyh7XG4gICAgICAgIHByb2plY3RzOiBbJ3RzY29uZmlnLmpzb24nLCAnLi4vdHdlbnR5LXVpL3RzY29uZmlnLmpzb24nXSxcbiAgICAgIH0pLFxuICAgICAgc3ZncigpLFxuICAgICAgY2hlY2tlcihjaGVja2VycyksXG4gICAgICAvLyBUT0RPOiBmaXggdGhpcywgd2UgaGF2ZSB0byByZXN0cmljdCB0aGUgaW5jbHVkZSB0byBvbmx5IHRoZSBjb21wb25lbnRzIHRoYXQgYXJlIHVzaW5nIGxpbmFyaWFcbiAgICAgIC8vIE90aGVyd2lzZSB0aGUgYnVpbGQgd2lsbCBmYWlsIGJlY2F1c2Ugd3l3IHRyaWVzIHRvIGluY2x1ZGUgZW1vdGlvbiBzdHlsZWQgY29tcG9uZW50c1xuICAgICAgd3l3KHtcbiAgICAgICAgaW5jbHVkZTogW1xuICAgICAgICAgICcqKi9DdXJyZW5jeURpc3BsYXkudHN4JyxcbiAgICAgICAgICAnKiovRWxsaXBzaXNEaXNwbGF5LnRzeCcsXG4gICAgICAgICAgJyoqL0NvbnRhY3RMaW5rLnRzeCcsXG4gICAgICAgICAgJyoqL0Jvb2xlYW5EaXNwbGF5LnRzeCcsXG4gICAgICAgICAgJyoqL0xpbmtzRGlzcGxheS50c3gnLFxuICAgICAgICAgICcqKi9Sb3VuZGVkTGluay50c3gnLFxuICAgICAgICAgICcqKi9PdmVyZmxvd2luZ1RleHRXaXRoVG9vbHRpcC50c3gnLFxuICAgICAgICAgICcqKi9DaGlwLnRzeCcsXG4gICAgICAgICAgJyoqL1RhZy50c3gnLFxuICAgICAgICAgICcqKi9NdWx0aVNlbGVjdEZpZWxkRGlzcGxheS50c3gnLFxuICAgICAgICAgICcqKi9SYXRpbmdJbnB1dC50c3gnLFxuICAgICAgICAgICcqKi9SZWNvcmRUYWJsZUNlbGxDb250YWluZXIudHN4JyxcbiAgICAgICAgICAnKiovUmVjb3JkVGFibGVDZWxsRGlzcGxheUNvbnRhaW5lci50c3gnLFxuICAgICAgICAgICcqKi9BdmF0YXIudHN4JyxcbiAgICAgICAgICAnKiovUmVjb3JkVGFibGVCb2R5RHJvcHBhYmxlLnRzeCcsXG4gICAgICAgICAgJyoqL1JlY29yZFRhYmxlQ2VsbEJhc2VDb250YWluZXIudHN4JyxcbiAgICAgICAgICAnKiovUmVjb3JkVGFibGVDZWxsVGQudHN4JyxcbiAgICAgICAgICAnKiovUmVjb3JkVGFibGVUZC50c3gnLFxuICAgICAgICAgICcqKi9SZWNvcmRUYWJsZUhlYWRlckRyYWdEcm9wQ29sdW1uLnRzeCcsXG4gICAgICAgIF0sXG4gICAgICAgIGJhYmVsT3B0aW9uczoge1xuICAgICAgICAgIHByZXNldHM6IFsnQGJhYmVsL3ByZXNldC10eXBlc2NyaXB0JywgJ0BiYWJlbC9wcmVzZXQtcmVhY3QnXSxcbiAgICAgICAgfSxcbiAgICAgIH0pLFxuICAgIF0sXG5cbiAgICBidWlsZDoge1xuICAgICAgb3V0RGlyOiAnYnVpbGQnLFxuICAgICAgc291cmNlbWFwOiBWSVRFX0JVSUxEX1NPVVJDRU1BUCA9PT0gJ3RydWUnLFxuICAgIH0sXG5cbiAgICBlbnZQcmVmaXg6ICdSRUFDVF9BUFBfJyxcblxuICAgIGRlZmluZToge1xuICAgICAgJ3Byb2Nlc3MuZW52Jzoge1xuICAgICAgICBSRUFDVF9BUFBfU0VSVkVSX0JBU0VfVVJMLFxuICAgICAgfSxcbiAgICB9LFxuICAgIGNzczoge1xuICAgICAgbW9kdWxlczoge1xuICAgICAgICBsb2NhbHNDb252ZW50aW9uOiAnY2FtZWxDYXNlT25seScsXG4gICAgICB9LFxuICAgIH0sXG4gIH07XG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBNFQsT0FBTyxXQUFXO0FBQzlVLE9BQU8sU0FBUztBQUNoQixPQUFPLFVBQVU7QUFDakIsU0FBUyxjQUFjLGVBQWU7QUFDdEMsT0FBTyxhQUFhO0FBQ3BCLE9BQU8sVUFBVTtBQUNqQixPQUFPLG1CQUFtQjtBQU4xQixJQUFNLG1DQUFtQztBQVd6QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLFNBQVMsS0FBSyxNQUFNO0FBQ2pELFFBQU0sTUFBTSxRQUFRLE1BQU0sUUFBUSxJQUFJLEdBQUcsRUFBRTtBQUszQyxRQUFNLEVBQUUsMkJBQTJCLHFCQUFxQixJQUFJO0FBRTVELFFBQU0saUJBQWlCLFlBQVk7QUFFbkMsUUFBTSxXQUFxQjtBQUFBLElBQ3pCLFlBQVk7QUFBQSxNQUNWLGNBQWMsS0FBSyxRQUFRLGtDQUFXLHFCQUFxQjtBQUFBLElBQzdEO0FBQUEsSUFDQSxTQUFTO0FBQUEsRUFDWDtBQUVBLE1BQUksQ0FBQyxnQkFBZ0I7QUFDbkIsYUFBUyxRQUFRLElBQUk7QUFBQSxNQUNuQixhQUNFO0FBQUEsSUFDSjtBQUFBLEVBQ0Y7QUFFQSxTQUFPO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixVQUFVO0FBQUEsSUFFVixRQUFRO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixNQUFNO0FBQUEsSUFDUjtBQUFBLElBRUEsU0FBUztBQUFBLE1BQ1AsTUFBTSxFQUFFLGlCQUFpQixpQkFBaUIsQ0FBQztBQUFBLE1BQzNDLGNBQWM7QUFBQSxRQUNaLFVBQVUsQ0FBQyxpQkFBaUIsNEJBQTRCO0FBQUEsTUFDMUQsQ0FBQztBQUFBLE1BQ0QsS0FBSztBQUFBLE1BQ0wsUUFBUSxRQUFRO0FBQUE7QUFBQTtBQUFBLE1BR2hCLElBQUk7QUFBQSxRQUNGLFNBQVM7QUFBQSxVQUNQO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsUUFDRjtBQUFBLFFBQ0EsY0FBYztBQUFBLFVBQ1osU0FBUyxDQUFDLDRCQUE0QixxQkFBcUI7QUFBQSxRQUM3RDtBQUFBLE1BQ0YsQ0FBQztBQUFBLElBQ0g7QUFBQSxJQUVBLE9BQU87QUFBQSxNQUNMLFFBQVE7QUFBQSxNQUNSLFdBQVcseUJBQXlCO0FBQUEsSUFDdEM7QUFBQSxJQUVBLFdBQVc7QUFBQSxJQUVYLFFBQVE7QUFBQSxNQUNOLGVBQWU7QUFBQSxRQUNiO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLEtBQUs7QUFBQSxNQUNILFNBQVM7QUFBQSxRQUNQLGtCQUFrQjtBQUFBLE1BQ3BCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
