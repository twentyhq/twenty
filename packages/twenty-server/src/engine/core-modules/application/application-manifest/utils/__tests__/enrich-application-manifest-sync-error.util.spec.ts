import { type Manifest } from 'twenty-shared/application';

import { enrichApplicationManifestSyncError } from 'src/engine/core-modules/application/application-manifest/utils/enrich-application-manifest-sync-error.util';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';

const OBJECT_UNIVERSAL_IDENTIFIER = 'object-universal-identifier';
const FIELD_UNIVERSAL_IDENTIFIER = 'field-universal-identifier';
const NESTED_FIELD_UNIVERSAL_IDENTIFIER = 'nested-field-universal-identifier';
const ROLE_UNIVERSAL_IDENTIFIER = 'role-universal-identifier';
const VIEW_FIELD_UNIVERSAL_IDENTIFIER = 'view-field-universal-identifier';

const manifest = {
  application: { displayName: 'Stripe' },
  objects: [
    {
      universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
      labelSingular: 'Invoice',
      fields: [
        {
          universalIdentifier: NESTED_FIELD_UNIVERSAL_IDENTIFIER,
          label: 'Due Date',
        },
      ],
    },
  ],
  fields: [
    {
      universalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
      label: 'Amount',
    },
  ],
  roles: [
    {
      universalIdentifier: ROLE_UNIVERSAL_IDENTIFIER,
      label: 'Support Agent',
    },
  ],
  viewFields: [
    {
      universalIdentifier: VIEW_FIELD_UNIVERSAL_IDENTIFIER,
    },
  ],
} as unknown as Manifest;

describe('enrichApplicationManifestSyncError', () => {
  it('should resolve the offending object and produce an installation exception', () => {
    const error = new FlatEntityMapsException(
      'addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow: flat entity to add already exists',
      FlatEntityMapsExceptionCode.ENTITY_ALREADY_EXISTS,
      {
        context: {
          universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
          operation: 'add',
        },
      },
    );

    const enriched = enrichApplicationManifestSyncError({ error, manifest });

    expect(enriched).toBeInstanceOf(ApplicationException);
    expect((enriched as ApplicationException).code).toBe(
      ApplicationExceptionCode.APPLICATION_INSTALLATION_FAILED,
    );
    expect((enriched as ApplicationException).message).toContain('Stripe');
    expect((enriched as ApplicationException).message).toContain('Invoice');
    expect((enriched as ApplicationException).message).toContain(
      'flat entity to add already exists',
    );
    expect((enriched as ApplicationException).context).toEqual({
      universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
      operation: 'add',
    });
  });

  it('should resolve the offending field by universalIdentifier', () => {
    const error = new FlatEntityMapsException(
      'entity malformed',
      FlatEntityMapsExceptionCode.ENTITY_MALFORMED,
      { context: { universalIdentifier: FIELD_UNIVERSAL_IDENTIFIER } },
    );

    const enriched = enrichApplicationManifestSyncError({ error, manifest });

    expect((enriched as ApplicationException).message).toContain('Amount');
  });

  it('should resolve a field nested in an object manifest by universalIdentifier', () => {
    const error = new FlatEntityMapsException(
      'flat entity to add already exists',
      FlatEntityMapsExceptionCode.ENTITY_ALREADY_EXISTS,
      { context: { universalIdentifier: NESTED_FIELD_UNIVERSAL_IDENTIFIER } },
    );

    const enriched = enrichApplicationManifestSyncError({ error, manifest });

    expect((enriched as ApplicationException).message).toContain('field');
    expect((enriched as ApplicationException).message).toContain('Due Date');
  });

  it('should resolve a labeled non-object/field kind (role) by universalIdentifier', () => {
    const error = new FlatEntityMapsException(
      'flat entity to add already exists',
      FlatEntityMapsExceptionCode.ENTITY_ALREADY_EXISTS,
      { context: { universalIdentifier: ROLE_UNIVERSAL_IDENTIFIER } },
    );

    const enriched = enrichApplicationManifestSyncError({ error, manifest });

    expect((enriched as ApplicationException).message).toContain('role');
    expect((enriched as ApplicationException).message).toContain(
      'Support Agent',
    );
  });

  it('should fall back to the entity kind when the resolved entity has no label', () => {
    const error = new FlatEntityMapsException(
      'flat entity to add already exists',
      FlatEntityMapsExceptionCode.ENTITY_ALREADY_EXISTS,
      { context: { universalIdentifier: VIEW_FIELD_UNIVERSAL_IDENTIFIER } },
    );

    const enriched = enrichApplicationManifestSyncError({ error, manifest });

    expect((enriched as ApplicationException).message).toContain('view field');
    expect((enriched as ApplicationException).message).not.toContain(
      'undefined',
    );
  });

  it('should still enrich when the identifier is not in the manifest', () => {
    const error = new FlatEntityMapsException(
      'entity not found',
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
      { context: { universalIdentifier: 'unknown-identifier' } },
    );

    const enriched = enrichApplicationManifestSyncError({ error, manifest });

    expect(enriched).toBeInstanceOf(ApplicationException);
    expect((enriched as ApplicationException).code).toBe(
      ApplicationExceptionCode.APPLICATION_INSTALLATION_FAILED,
    );
    expect((enriched as ApplicationException).message).toContain('Stripe');
  });

  it('should extract context forwarded through a wrapper exception', () => {
    const wrapperError = {
      message: 'wrapped failure',
      context: { universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER },
    };

    const enriched = enrichApplicationManifestSyncError({
      error: wrapperError,
      manifest,
    });

    expect(enriched).toBeInstanceOf(ApplicationException);
    expect((enriched as ApplicationException).message).toContain('Invoice');
  });

  it('should leave non flat-entity errors untouched', () => {
    const error = new Error('some unrelated failure');

    const enriched = enrichApplicationManifestSyncError({ error, manifest });

    expect(enriched).toBe(error);
  });
});
