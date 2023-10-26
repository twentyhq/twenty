const path = require("path");

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
    }
  },
  webpack: {
    alias: {
      '~': path.resolve(__dirname, 'src'),
      '@': path.resolve(__dirname, 'src/modules'),
      '@testing': path.resolve(__dirname, 'src/testing'),
    },
    mode: 'extends',
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
