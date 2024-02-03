// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

import { themes } from 'prism-react-renderer';

const lightCodeTheme = themes.github;
const darkCodeTheme = themes.dracula;

const filterOutCategory = (items, categoryNameToExclude) => {
  return items.reduce((filteredItems, item) => {
    if (item.type === 'category' && item.label === categoryNameToExclude) {
      // Skip adding the item if the category should be excluded
      return filteredItems;
    } else if (item.type === 'category') {
      // Recursively filter sub-categories
      return filteredItems.concat({
        ...item,
        items: filterOutCategory(item.items, categoryNameToExclude),
      });
    } else {
      // Include the item if it's not a category to be excluded
      return filteredItems.concat(item);
    }
  }, []);
};

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Twenty - Documentation',
  tagline: 'Twenty is cool',
  favicon: 'img/logo-square-dark.ico',

  // Prevent search engines from indexing the doc for selected environments
  noIndex: process.env.SHOULD_INDEX_DOC === 'false',

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
  plugins: ['docusaurus-node-polyfills'],
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          breadcrumbs: false,
          sidebarPath: require.resolve('./sidebars.js'),
          sidebarCollapsible: false,
          routeBasePath: '/',
          editUrl:
            'https://github.com/twentyhq/twenty/tree/main/packages/twenty-docs',
          sidebarItemsGenerator: async ({
            defaultSidebarItemsGenerator,
            ...args
          }) => {
            const sidebarItems = await defaultSidebarItemsGenerator(args);

            return filterOutCategory(sidebarItems, 'UI Components');
          },
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
      image: 'img/social-card.png',
      colorMode: {
        defaultMode: 'light',
        respectPrefersColorScheme: false,
      },
      docs: {
        sidebar: {
          autoCollapseCategories: true,
        },
      },
      navbar: {
        title: 'for Developers',
        logo: {
          alt: 'Twenty',
          src: 'img/logo-square-dark.svg',
          srcDark: 'img/logo-square-light.svg',
        },
        items: [
          /*{
            to: 'https://github.com/twentyhq/twenty/releases',
            label: 'Releases',
            position: 'right',
          },*/
          {
            type: 'custom-github-link',
            position: 'right',
          },
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
