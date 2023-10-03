const path = require("path");
const million = require('million/compiler');

module.exports = {
  devServer: {
    client: {
      overlay: {
        runtimeErrors: (error) => {
          if (error.message === "ResizeObserver loop limit exceeded") {
            return false;
          }
          if (error.message === "Unauthorized") {
            return false;
          }
          return true;
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
    plugins: [
      million.webpack({ auto: true }),
    ],
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
