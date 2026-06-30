import { getIsMetadataItemFromStandardApplication } from '@/object-metadata/utils/getIsMetadataItemFromStandardApplication';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

describe('getIsMetadataItemFromStandardApplication', () => {
  const applications = [
    {
      id: 'standard-application-id',
      universalIdentifier: TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    },
    {
      id: 'workspace-custom-application-id',
      universalIdentifier: 'workspace-custom-application-universal-id',
    },
    {
      id: 'installed-application-id',
      universalIdentifier: 'installed-application-universal-id',
    },
  ];

  it('should return true when metadata item belongs to the standard application', () => {
    expect(
      getIsMetadataItemFromStandardApplication(
        { applicationId: 'standard-application-id' },
        applications,
      ),
    ).toBe(true);
  });

  it('should return false when metadata item belongs to the workspace custom application', () => {
    expect(
      getIsMetadataItemFromStandardApplication(
        { applicationId: 'workspace-custom-application-id' },
        applications,
      ),
    ).toBe(false);
  });

  it('should return false when metadata item belongs to an installed application', () => {
    expect(
      getIsMetadataItemFromStandardApplication(
        { applicationId: 'installed-application-id' },
        applications,
      ),
    ).toBe(false);
  });

  it('should return undefined when metadata item application cannot be resolved', () => {
    expect(
      getIsMetadataItemFromStandardApplication(
        { applicationId: 'unknown-application-id' },
        applications,
      ),
    ).toBeUndefined();
  });
});
