const path = require("path");

module.exports = {
  webpack: {
    alias: {
      '~': path.resolve(__dirname, 'src'),
      '@': path.resolve(__dirname, 'src/modules'),
      '@testing': path.resolve(__dirname, 'src/testing'),
    }
  },
  jest: {
    configure: {
      "moduleNameMapper": {
        '~/(.+)': "<rootDir>/src/$1",
        '@/(.+)': "<rootDir>/src/modules/$1",
        '@testing/(.+)': "<rootDir>/src/testing/$1",
      }
    }
  },
};
