import { Test, type TestingModule } from '@nestjs/testing';

import { type Manifest } from 'twenty-shared/application';

import { ApplicationRegistrationAssetUrlService } from 'src/engine/core-modules/application/application-registration/application-registration-asset-url.service';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const CONFIG_VALUES: Record<string, string> = {
  SERVER_URL: 'https://api.twenty.com',
  APP_REGISTRY_CDN_URL: 'https://cdn.registry.com',
};

const baseRegistration = {
  id: 'registration-id',
  sourceType: ApplicationRegistrationSourceType.TARBALL,
  sourcePackage: null,
  latestAvailableVersion: '1.0.0',
  logo: null,
  logoFileId: null,
  galleryImages: null,
  screenshots: [],
  manifest: null,
};

describe('ApplicationRegistrationAssetUrlService', () => {
  let service: ApplicationRegistrationAssetUrlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationRegistrationAssetUrlService,
        {
          provide: TwentyConfigService,
          useValue: {
            get: jest.fn((key: string) => CONFIG_VALUES[key]),
          },
        },
      ],
    }).compile();

    service = module.get(ApplicationRegistrationAssetUrlService);
  });

  describe('buildLogoUrl', () => {
    it('should build a server file url when a logoFileId is set', () => {
      const logoUrl = service.buildLogoUrl({
        ...baseRegistration,
        logo: 'public/logo.png',
        logoFileId: 'file-id',
      });

      expect(logoUrl).toBe(
        'https://api.twenty.com/files/application-registrations/registration-id/public/logo.png',
      );
    });

    it('should url-encode stored asset path segments', () => {
      const logoUrl = service.buildLogoUrl({
        ...baseRegistration,
        logo: 'public/logo #1.png',
        logoFileId: 'file-id',
      });

      expect(logoUrl).toBe(
        'https://api.twenty.com/files/application-registrations/registration-id/public/logo%20%231.png',
      );
    });

    it('should pass through absolute logo urls', () => {
      const logoUrl = service.buildLogoUrl({
        ...baseRegistration,
        logo: 'https://example.com/logo.png',
      });

      expect(logoUrl).toBe('https://example.com/logo.png');
    });

    it('should build a registry cdn url for npm registrations', () => {
      const logoUrl = service.buildLogoUrl({
        ...baseRegistration,
        sourceType: ApplicationRegistrationSourceType.NPM,
        sourcePackage: '@twenty/my-app',
        latestAvailableVersion: '2.3.4',
        logo: 'public/logo.png',
      });

      expect(logoUrl).toBe(
        'https://cdn.registry.com/@twenty/my-app@2.3.4/public/logo.png',
      );
    });

    it('should return null for a relative path without a stored file on non-npm registrations', () => {
      const logoUrl = service.buildLogoUrl({
        ...baseRegistration,
        logo: 'public/logo.png',
      });

      expect(logoUrl).toBeNull();
    });

    it('should return null when there is no logo at all', () => {
      const logoUrl = service.buildLogoUrl(baseRegistration);

      expect(logoUrl).toBeNull();
    });
  });

  describe('buildGalleryImageUrls', () => {
    it('should resolve stored gallery images by fileId and keep absolute urls', () => {
      const urls = service.buildGalleryImageUrls({
        ...baseRegistration,
        galleryImages: [
          { path: 'public/one.png', fileId: 'file-1' },
          { path: 'https://example.com/two.png', fileId: null },
          { path: 'public/missing.png', fileId: null },
        ],
      });

      expect(urls).toEqual([
        'https://api.twenty.com/files/application-registrations/registration-id/public/one.png',
        'https://example.com/two.png',
      ]);
    });

    it('should resolve npm gallery images from the registry cdn', () => {
      const urls = service.buildGalleryImageUrls({
        ...baseRegistration,
        sourceType: ApplicationRegistrationSourceType.NPM,
        sourcePackage: '@twenty/my-app',
        latestAvailableVersion: '2.3.4',
        galleryImages: [{ path: 'public/one.png', fileId: null }],
      });

      expect(urls).toEqual([
        'https://cdn.registry.com/@twenty/my-app@2.3.4/public/one.png',
      ]);
    });

    it('should fall back to the deprecated screenshots column', () => {
      const urls = service.buildGalleryImageUrls({
        ...baseRegistration,
        screenshots: ['https://example.com/screenshot.png'],
      });

      expect(urls).toEqual(['https://example.com/screenshot.png']);
    });

    it('should fall back to manifest gallery images when nothing is backfilled', () => {
      const urls = service.buildGalleryImageUrls({
        ...baseRegistration,
        manifest: {
          application: {
            galleryImages: ['https://example.com/from-manifest.png'],
          },
        } as unknown as Manifest,
      });

      expect(urls).toEqual(['https://example.com/from-manifest.png']);
    });
  });
});
