import {
  type FieldManifest,
  type LogicFunctionManifest,
  type ObjectManifest,
  type PageLayoutManifest,
  type ViewManifest,
} from 'twenty-shared/application';
import {
  FieldMetadataType,
  NavigationMenuItemType,
  PageLayoutType,
} from 'twenty-shared/types';

import { buildApplicationContentFromManifest } from 'src/engine/core-modules/application/application-content/utils/build-application-content-from-manifest.util';

const INVOICE_OBJECT: ObjectManifest = {
  universalIdentifier: 'invoice',
  nameSingular: 'invoice',
  namePlural: 'invoices',
  labelSingular: 'Invoice',
  labelPlural: 'Invoices',
  labelIdentifierFieldMetadataUniversalIdentifier: 'amount',
  fields: [
    {
      universalIdentifier: 'amount',
      name: 'amount',
      label: 'Amount',
      type: FieldMetadataType.NUMBER,
    },
  ],
};

const TIER_FIELD: FieldManifest = {
  universalIdentifier: 'tier',
  name: 'tier',
  label: 'Tier',
  type: FieldMetadataType.TEXT,
  objectUniversalIdentifier: 'company',
};

const ALL_INVOICES_VIEW: ViewManifest = {
  universalIdentifier: 'all-invoices',
  name: 'All invoices',
  objectUniversalIdentifier: 'invoice',
  fields: [
    {
      universalIdentifier: 'view-amount',
      fieldMetadataUniversalIdentifier: 'amount',
      position: 0.5,
    },
  ],
};

const INVOICE_PAGE_LAYOUT: PageLayoutManifest = {
  universalIdentifier: 'invoice-page',
  name: 'Invoice page',
  type: PageLayoutType.RECORD_PAGE,
  tabs: [{ universalIdentifier: 'overview', title: 'Overview', position: 0 }],
};

const NIGHTLY_LOGIC_FUNCTION: LogicFunctionManifest = {
  universalIdentifier: 'nightly',
  name: 'Nightly cleanup',
  cronTriggerSettings: { pattern: '0 0 * * *' },
  sourceHandlerPath: 'src/nightly.ts',
  builtHandlerPath: 'nightly.js',
  builtHandlerChecksum: 'checksum',
  handlerName: 'main',
};

describe('buildApplicationContentFromManifest', () => {
  it('should merge nested and standalone fields and count them per object', () => {
    const content = buildApplicationContentFromManifest({
      objects: [INVOICE_OBJECT],
      fields: [TIER_FIELD],
      views: [ALL_INVOICES_VIEW],
    });

    expect(content.objects).toEqual([
      expect.objectContaining({ label: 'Invoices', count: 1 }),
    ]);
    expect(content.fields).toEqual([
      expect.objectContaining({
        label: 'Amount',
        objectUniversalIdentifier: 'invoice',
        count: 1,
      }),
      expect.objectContaining({
        label: 'Tier',
        objectUniversalIdentifier: 'company',
        count: 0,
      }),
    ]);
    expect(content.views).toEqual([
      expect.objectContaining({ label: 'All invoices', count: 1 }),
    ]);
    expect(content.viewFields).toEqual([
      expect.objectContaining({
        label: 'Amount',
        parentLabel: 'All invoices',
        parentUniversalIdentifier: 'all-invoices',
        position: 0.5,
      }),
    ]);
  });

  it('should not count views the content does not list', () => {
    const content = buildApplicationContentFromManifest({
      fields: [TIER_FIELD],
      viewFields: [
        {
          universalIdentifier: 'all-companies-tier',
          fieldMetadataUniversalIdentifier: 'tier',
          viewUniversalIdentifier: 'all-companies',
          position: 3,
        },
      ],
    });

    expect(content.fields).toEqual([
      expect.objectContaining({ label: 'Tier', count: 0 }),
    ]);
    expect(content.viewFields).toEqual([
      expect.objectContaining({
        parentUniversalIdentifier: 'all-companies',
      }),
    ]);
  });

  it('should tag page layouts, logic functions and public assets', () => {
    const content = buildApplicationContentFromManifest({
      pageLayouts: [INVOICE_PAGE_LAYOUT],
      logicFunctions: [NIGHTLY_LOGIC_FUNCTION],
      publicAssets: [
        {
          filePath: 'logo.png',
          fileName: 'logo.png',
          fileType: 'png',
          checksum: null,
        },
        {
          filePath: 'terms.pdf',
          fileName: 'terms.pdf',
          fileType: 'pdf',
          checksum: null,
        },
      ],
      translations: { 'fr-FR': { hello: 'bonjour', bye: 'au revoir' } },
    });

    expect(content.pageLayouts).toEqual([
      expect.objectContaining({ tag: PageLayoutType.RECORD_PAGE, count: 1 }),
    ]);
    expect(content.pageLayoutTabs).toEqual([
      expect.objectContaining({
        label: 'Overview',
        parentLabel: 'Invoice page',
      }),
    ]);
    expect(content.logicFunctions).toEqual([
      expect.objectContaining({
        label: 'Nightly cleanup',
        tag: 'CRON',
        timeoutSeconds: 300,
      }),
    ]);
    expect(content.publicAssets.map(({ tag }) => tag)).toEqual([
      'IMAGE',
      'FILE',
    ]);
    expect(content.translations).toEqual([
      expect.objectContaining({ label: 'fr-FR', count: 2 }),
    ]);
  });

  it('should list MCP servers with their URL', () => {
    const content = buildApplicationContentFromManifest({
      mcpServers: [
        {
          universalIdentifier: 'stripe-mcp',
          name: 'stripe',
          label: 'Stripe',
          url: 'https://mcp.stripe.com',
        },
      ],
    });

    expect(content.mcpServers).toEqual([
      {
        universalIdentifier: 'stripe-mcp',
        label: 'Stripe',
        description: 'https://mcp.stripe.com',
      },
    ]);
  });

  it('should read the parent folder from manifests that still use folderUniversalIdentifier', () => {
    const content = buildApplicationContentFromManifest({
      navigationMenuItems: [
        {
          universalIdentifier: 'billing-folder',
          type: NavigationMenuItemType.FOLDER,
          name: 'Billing',
          position: 0,
        },
        {
          universalIdentifier: 'billing-link',
          type: NavigationMenuItemType.LINK,
          name: 'Billing portal',
          link: 'https://example.com',
          position: 0,
          folderUniversalIdentifier: 'billing-folder',
        },
      ],
    });

    expect(content.navigationMenuItems).toContainEqual(
      expect.objectContaining({
        universalIdentifier: 'billing-link',
        parentLabel: 'Billing',
        parentUniversalIdentifier: 'billing-folder',
      }),
    );
  });
});
