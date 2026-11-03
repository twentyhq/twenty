import { getNavigationMenuItemCurrentObjectMetadata } from '@/navigation-menu-item/display/utils/getNavigationMenuItemCurrentObjectMetadata';

const activeObjectMetadataItems = [
  { id: 'company', nameSingular: 'company', namePlural: 'companies' },
  { id: 'workflow', nameSingular: 'workflow', namePlural: 'workflows' },
];

it.each(['/getting-started', '/', '/agents', '/settings/profile'])(
  'does not retain an object highlight on %s',
  (currentPath) => {
    expect(
      getNavigationMenuItemCurrentObjectMetadata({
        activeObjectMetadataItems,
        currentPath,
      }),
    ).toBeUndefined();
  },
);

it.each(['/workflows', '/workflow/workflow-id'])(
  'identifies the workflow object on %s without stored context',
  (currentPath) => {
    expect(
      getNavigationMenuItemCurrentObjectMetadata({
        activeObjectMetadataItems,
        currentPath,
      })?.id,
    ).toBe('workflow');
  },
);
