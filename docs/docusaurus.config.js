// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Twenty - Documentation',
  tagline: 'Dinosaurs are cool',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://docs.twenty.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  headTags: [
    {
      tagName: 'link',
      attributes: {
        rel: 'stylesheet',
        href: 'https://kit.fontawesome.com/c4eca3d765.css',
        crossorigin: 'anonymous'
      },
    },
  ],

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
          editUrl:
            'https://github.com/twentyhq/twenty/edit/main/docs/docs/',
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        /*title: 'Twenty',*/
        logo: {
          alt: 'Twenty',
          src: 'https://twenty.com/wp-content/uploads/2023/03/Screenshot-2023-03-07-at-22.21.44-2.png',
        },
        items: [
          {
            type: 'search',
            position: 'left',
          },
          {
            type: 'docSidebar',
            sidebarId: 'docsSidebar',
            position: 'right',
            label: 'Developer Docs',
          },
          {
            type: 'docSidebar',
            sidebarId: 'userGuideSidebar',
            position: 'right',
            label: 'User guide',
          },
          {
            type: 'docSidebar',
            sidebarId: 'APISidebar',
            position: 'right',
            label: 'API',
          },
          {
            to: 'https://github.com/twentyhq/twenty/releases',
            label: 'Releases',
            position: 'right'
          }
          /*{
            href: 'https://github.com/twentyhq/twenty',
            label: 'GitHub',
            position: 'right',
          }*/,
        ],
      },
      algolia: {
        appId: 'YOUR_APP_ID',
        apiKey: 'YOUR_SEARCH_API_KEY',
        indexName: 'YOUR_INDEX_NAME',
  
        // Optional: see doc section below
        contextualSearch: true,
        // Optional: Specify domains where the navigation should occur through window.location instead on history.push. Useful when our Algolia config crawls multiple documentation sites and we want to navigate with window.location.href to them.
        externalUrlRegex: 'external\\.com|domain\\.com',
        // Optional: Replace parts of the item URLs from Algolia. Useful when using the same search index for multiple deployments using a different baseUrl. You can use regexp or string in the `from` param. For example: localhost:3000 vs myCompany.com/docs
        replaceSearchResultPathname: {
          from: '/docs/', // or as RegExp: /\/docs\//
          to: '/',
        },
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
