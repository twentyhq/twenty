import { type ApplicationContent } from '@/settings/applications/types/ApplicationContent';
import { getMarketplaceApplicationContentLink } from '@/settings/applications/utils/getMarketplaceApplicationContentLink';

const EMPTY_CONTENT: ApplicationContent = {
  objects: [],
  fields: [],
  indexes: [],
  views: [],
  viewFields: [],
  pageLayouts: [],
  pageLayoutTabs: [],
  navigationMenuItems: [],
  commandMenuItems: [],
  frontComponents: [],
  workflows: [],
  logicFunctions: [],
  agents: [],
  skills: [],
  roles: [],
  permissionFlags: [],
  connectionProviders: [],
  publicAssets: [],
  translations: [],
};

const INVOICE_OBJECT: ApplicationContent['objects'][number] = {
  __typename: 'ApplicationContentItem',
  id: null,
  universalIdentifier: 'invoice',
  label: 'Invoices',
  icon: null,
  color: null,
  description: null,
  objectUniversalIdentifier: null,
  parentLabel: null,
  parentUniversalIdentifier: null,
  fieldUniversalIdentifier: null,
  tag: null,
  count: 0,
  position: null,
  timeoutSeconds: null,
};

describe('getMarketplaceApplicationContentLink', () => {
  it('should link to the resources page with the item count', () => {
    expect(
      getMarketplaceApplicationContentLink({
        availableApplicationId: 'available-application-id',
        content: { ...EMPTY_CONTENT, objects: [INVOICE_OBJECT] },
      }),
    ).toEqual({
      path: '/settings/applications/available/available-application-id/resources',
      itemCount: 1,
    });
  });

  it('should return undefined when the content is empty', () => {
    expect(
      getMarketplaceApplicationContentLink({
        availableApplicationId: 'available-application-id',
        content: EMPTY_CONTENT,
      }),
    ).toBeUndefined();
  });

  it('should return undefined while the content is loading', () => {
    expect(
      getMarketplaceApplicationContentLink({
        availableApplicationId: 'available-application-id',
        content: undefined,
      }),
    ).toBeUndefined();
  });
});
