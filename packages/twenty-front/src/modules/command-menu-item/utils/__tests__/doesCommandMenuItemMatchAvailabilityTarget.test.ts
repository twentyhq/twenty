import { doesCommandMenuItemMatchAvailabilityTarget } from '@/command-menu-item/utils/doesCommandMenuItemMatchAvailabilityTarget';
import { type CommandMenuItemFieldsFragment } from '~/generated-metadata/graphql';

const buildItem = (
  availability: Pick<
    CommandMenuItemFieldsFragment,
    'availabilityObjectMetadataId' | 'availabilityCoreObjectName'
  >,
) => availability as CommandMenuItemFieldsFragment;

describe('doesCommandMenuItemMatchAvailabilityTarget', () => {
  const onCompanies = doesCommandMenuItemMatchAvailabilityTarget({
    objectMetadataItemId: 'company-object-id',
    coreObjectName: null,
  });
  const onCoreWorkflows = doesCommandMenuItemMatchAvailabilityTarget({
    objectMetadataItemId: undefined,
    coreObjectName: 'workflow',
  });

  it('shows core workflow commands only on core workflow pages', () => {
    const activateWorkflow = buildItem({
      availabilityObjectMetadataId: null,
      availabilityCoreObjectName: 'workflow',
    });

    expect(onCoreWorkflows(activateWorkflow)).toBe(true);
    expect(onCompanies(activateWorkflow)).toBe(false);
  });

  it('keeps object-scoped commands on their object only', () => {
    const companyCommand = buildItem({
      availabilityObjectMetadataId: 'company-object-id',
      availabilityCoreObjectName: null,
    });

    expect(onCompanies(companyCommand)).toBe(true);
    expect(onCoreWorkflows(companyCommand)).toBe(false);
  });

  it('shows unscoped commands everywhere', () => {
    const globalCommand = buildItem({
      availabilityObjectMetadataId: null,
      availabilityCoreObjectName: null,
    });

    expect(onCompanies(globalCommand)).toBe(true);
    expect(onCoreWorkflows(globalCommand)).toBe(true);
  });
});
