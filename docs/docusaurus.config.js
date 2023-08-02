
// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Twenty - Documentation',
  tagline: 'Dinosaurs are cool',
  favicon: 'img/logo-square-dark.ico',

  // Prevent search engines from indexing the site if not for production
  noIndex: process.env.NODE_ENV !== 'production',

  // Set the production url of your site here
  url: 'https://docs.twenty.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  headTags: [],

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          sidebarCollapsible: false,
          routeBasePath: '/',
          editUrl: 'https://github.com/twentyhq/twenty/edit/main/docs/docs/',
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),

    ]
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/social-card.png',
      navbar: {
        /*title: 'Twenty',*/
        logo: {
          alt: 'Twenty',
          src: 'img/logo-square-dark.svg',
          srcDark: 'img/logo-square-light.svg',
        },
        items: [
          {
            type: 'search',
            position: 'left',
          },
          {
            to: '/graphql/',
            label: 'GraphQL Playground',
            position: 'right'
          },
          {
            to: 'https://github.com/twentyhq/twenty/releases',
            label: 'Releases',
            position: 'right'
          }
        ],
      },
      algolia: {
        appId: 'J2OX2P2QAO',
        apiKey: 'e0a7a59c7862598a0cf87307c8ea97f2',
        indexName: 'twenty',
  
        // Optional: see doc section below
        contextualSearch: true,
        // Optional: Specify domains where the navigation should occur through window.location instead on history.push. Useful when our Algolia config crawls multiple documentation sites and we want to navigate with window.location.href to them.
        // externalUrlRegex: 'external\\.com|domain\\.com',
        // Optional: Replace parts of the item URLs from Algolia. Useful when using the same search index for multiple deployments using a different baseUrl. You can use regexp or string in the `from` param. For example: localhost:3000 vs myCompany.com/docs
        /* replaceSearchResultPathname: {
          from: '/docs/', // or as RegExp: /\/docs\//
          to: '/',
        },*/
        // Optional: Algolia search parameters
        searchParameters: {},
        // Optional: path for search page that enabled by default (`false` to disable it)
        searchPagePath: 'search',
      },
      /* footer: {
        copyright: `© ${new Date().getFullYear()} Twenty. Docs generated with Docusaurus.`,
      },*/
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
