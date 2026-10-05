import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { ApplicationExceptionCode } from 'src/engine/core-modules/application/application.exception';
import { resolveTargetApplicationOrThrow } from 'src/engine/core-modules/application/utils/resolve-target-application-or-throw.util';

const CALLING_APPLICATION = {
  id: 'b1a4c0d2-6e1f-4a6b-9c1d-0f2e3a4b5c6d',
  universalIdentifier: '7d3c2b1a-0f9e-4d8c-b7a6-5f4e3d2c1b0a',
};

const OTHER_APPLICATION = {
  id: 'e5f6a7b8-c9d0-4e1f-a2b3-c4d5e6f7a8b9',
  universalIdentifier: '1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
};

const expectForbidden = (resolve: () => unknown) => {
  expect(resolve).toThrow(
    expect.objectContaining({ code: ApplicationExceptionCode.FORBIDDEN }),
  );
};

const expectInvalidInput = (resolve: () => unknown) => {
  expect(resolve).toThrow(
    expect.objectContaining({ code: ApplicationExceptionCode.INVALID_INPUT }),
  );
};

describe('resolveTargetApplicationOrThrow', () => {
  describe.each([
    ApplicationRegistrationSourceType.LOCAL,
    ApplicationRegistrationSourceType.NPM,
    ApplicationRegistrationSourceType.TARBALL,
  ])('with a %s application caller', (sourceType) => {
    const callingApplication = { ...CALLING_APPLICATION, sourceType };

    it('should target the calling application when no argument is given', () => {
      expect(
        resolveTargetApplicationOrThrow({
          callingApplication,
        }),
      ).toEqual({ targetApplicationId: CALLING_APPLICATION.id });
    });

    it('should accept the calling application named by id or universal identifier', () => {
      expect(
        resolveTargetApplicationOrThrow({
          callingApplication,
          applicationId: CALLING_APPLICATION.id,
        }),
      ).toEqual({ targetApplicationId: CALLING_APPLICATION.id });
      expect(
        resolveTargetApplicationOrThrow({
          callingApplication,
          applicationUniversalIdentifier:
            CALLING_APPLICATION.universalIdentifier,
        }),
      ).toEqual({ targetApplicationId: CALLING_APPLICATION.id });
    });

    it('should refuse another application named by id', () => {
      expectForbidden(() =>
        resolveTargetApplicationOrThrow({
          callingApplication,
          applicationId: OTHER_APPLICATION.id,
        }),
      );
    });

    it('should refuse another application named by universal identifier', () => {
      expectForbidden(() =>
        resolveTargetApplicationOrThrow({
          callingApplication,
          applicationUniversalIdentifier: OTHER_APPLICATION.universalIdentifier,
        }),
      );
    });

    it('should refuse another application even when its own id is also given', () => {
      expectForbidden(() =>
        resolveTargetApplicationOrThrow({
          callingApplication,
          applicationId: CALLING_APPLICATION.id,
          applicationUniversalIdentifier: OTHER_APPLICATION.universalIdentifier,
        }),
      );
    });
  });

  describe('with an OAuth-only application caller', () => {
    const callingApplication = {
      ...CALLING_APPLICATION,
      sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
    };

    it('should accept another application by id', () => {
      expect(
        resolveTargetApplicationOrThrow({
          callingApplication,
          applicationId: OTHER_APPLICATION.id,
        }),
      ).toEqual({ targetApplicationId: OTHER_APPLICATION.id });
    });

    it('should accept another application by universal identifier', () => {
      expect(
        resolveTargetApplicationOrThrow({
          callingApplication,
          applicationUniversalIdentifier: OTHER_APPLICATION.universalIdentifier,
        }),
      ).toEqual({
        targetApplicationUniversalIdentifier:
          OTHER_APPLICATION.universalIdentifier,
      });
    });

    it('should require an explicit target instead of selecting the OAuth client', () => {
      expectInvalidInput(() =>
        resolveTargetApplicationOrThrow({ callingApplication }),
      );
    });

    it('should refuse two identifiers', () => {
      expectInvalidInput(() =>
        resolveTargetApplicationOrThrow({
          callingApplication,
          applicationId: OTHER_APPLICATION.id,
          applicationUniversalIdentifier: OTHER_APPLICATION.universalIdentifier,
        }),
      );
    });
  });

  describe('without an application caller', () => {
    it('should keep the one identifier given', () => {
      expect(
        resolveTargetApplicationOrThrow({
          callingApplication: undefined,
          applicationId: OTHER_APPLICATION.id,
        }),
      ).toEqual({ targetApplicationId: OTHER_APPLICATION.id });
      expect(
        resolveTargetApplicationOrThrow({
          callingApplication: null,
          applicationUniversalIdentifier: OTHER_APPLICATION.universalIdentifier,
        }),
      ).toEqual({
        targetApplicationUniversalIdentifier:
          OTHER_APPLICATION.universalIdentifier,
      });
    });

    it('should refuse two identifiers, which nothing reconciles', () => {
      expectInvalidInput(() =>
        resolveTargetApplicationOrThrow({
          callingApplication: undefined,
          applicationId: CALLING_APPLICATION.id,
          applicationUniversalIdentifier: OTHER_APPLICATION.universalIdentifier,
        }),
      );
    });

    it('should require an identifier', () => {
      expectInvalidInput(() =>
        resolveTargetApplicationOrThrow({ callingApplication: undefined }),
      );
    });
  });
});
