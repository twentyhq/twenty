const path = require("path");
const { launchEditorMiddleware } = require('@react-dev-inspector/middleware')

module.exports = {
  devServer: {
    client: {
      overlay: {
        runtimeErrors: (error) => {
          switch (error.message) {
            case "ResizeObserver loop limit exceeded":
            case "Unauthenticated":
              return false;
            default:
              return true;
          }
        },
      },
    },
    setupMiddlewares(middlewares) {
      
      middlewares.unshift(launchEditorMiddleware)
      
        console.log({ middlewares })
      return middlewares
    } 
  },
  webpack: {
    alias: {
      '~': path.resolve(__dirname, 'src'),
      '@': path.resolve(__dirname, 'src/modules'),
      '@testing': path.resolve(__dirname, 'src/testing'),
    },
    // TODO: remove this workaround by resolving source map errors with @sniptt/guards
    configure: {
        module: {
            rules: [
                {
                    test: /\.js$/,
                    enforce: "pre",
                    use: ["source-map-loader"],
                },
            ],
        },
        ignoreWarnings: [/Failed to parse source map/],
    },
  },
  jest: {
    configure: {
      moduleNameMapper: {
        '~/(.+)': "<rootDir>/src/$1",
        '@/(.+)': "<rootDir>/src/modules/$1",
        '@testing/(.+)': "<rootDir>/src/testing/$1",
      }
    },
  },
};
