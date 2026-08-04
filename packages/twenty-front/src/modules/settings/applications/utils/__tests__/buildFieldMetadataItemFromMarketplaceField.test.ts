import { buildFieldMetadataItemFromMarketplaceField } from '@/settings/applications/utils/buildFieldMetadataItemFromMarketplaceField';

import { type ObjectFieldManifest } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';

const marketplaceField: ObjectFieldManifest = {
  universalIdentifier: '20202020-1111-4111-8111-111111111111',
  name: 'companyName',
  label: 'Company name',
  type: FieldMetadataType.TEXT,
};

describe('buildFieldMetadataItemFromMarketplaceField', () => {
  it('uses the canonical field icon when the app does not provide one', () => {
    expect(
      buildFieldMetadataItemFromMarketplaceField(marketplaceField).icon,
    ).toBe('IconListDetails');
  });

  it('preserves the icon provided by the app', () => {
    expect(
      buildFieldMetadataItemFromMarketplaceField({
        ...marketplaceField,
        icon: 'IconBuilding',
      }).icon,
    ).toBe('IconBuilding');
  });
});
