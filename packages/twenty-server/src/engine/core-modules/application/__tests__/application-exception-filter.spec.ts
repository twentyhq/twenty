import { i18n } from '@lingui/core';
import { type Manifest } from 'twenty-shared/application';

import { ApplicationExceptionFilter } from 'src/engine/core-modules/application/application-exception-filter';
import { enrichApplicationManifestSyncError } from 'src/engine/core-modules/application/application-manifest/utils/enrich-application-manifest-sync-error.util';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import {
  type BaseGraphQLError,
  ErrorCode,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';

const OBJECT_UNIVERSAL_IDENTIFIER = 'b1b2c3d4-0003-4000-a000-000000000003';

const manifest: Manifest = {
  application: {
    universalIdentifier: 'application-universal-identifier',
    defaultRoleUniversalIdentifier: 'default-role-universal-identifier',
    displayName: 'Test Application',
    description: '',
    packageJsonChecksum: '',
    yarnLockChecksum: null,
  },
  objects: [
    {
      universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
      nameSingular: 'invoice',
      namePlural: 'invoices',
      labelSingular: 'Invoice',
      labelPlural: 'Invoices',
      fields: [],
      labelIdentifierFieldMetadataUniversalIdentifier:
        'label-identifier-universal-identifier',
    },
  ],
  fields: [],
  roles: [],
  viewFields: [],
  logicFunctions: [],
  frontComponents: [],
  permissionFlags: [],
  skills: [],
  agents: [],
  publicAssets: [],
  views: [],
  navigationMenuItems: [],
  pageLayouts: [],
  pageLayoutTabs: [],
  pageLayoutWidgets: [],
  commandMenuItems: [],
  timelineActivityTypes: [],
  settingsMenuItems: [],
};

const catchAsGraphQLError = (exception: ApplicationException) => {
  const filter = new ApplicationExceptionFilter();

  try {
    filter.catch(exception);
  } catch (graphqlError) {
    return graphqlError as BaseGraphQLError;
  }

  throw new Error('ApplicationExceptionFilter did not throw');
};

describe('ApplicationExceptionFilter response error format', () => {
  it('should surface an install conflict as APPLICATION_INSTALLATION_FAILED with a human message', () => {
    const originalError = new FlatEntityMapsException(
      'addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow: flat entity to add already exists (universalIdentifier: b1b2c3d4-0003-4000-a000-000000000003)',
      FlatEntityMapsExceptionCode.ENTITY_ALREADY_EXISTS,
      {
        context: {
          universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
          operation: 'add',
        },
      },
    );

    const enrichedError = enrichApplicationManifestSyncError({
      error: originalError,
      manifest,
    }) as ApplicationException;

    expect(enrichedError.code).toBe(
      ApplicationExceptionCode.APPLICATION_INSTALLATION_FAILED,
    );

    const graphqlError = catchAsGraphQLError(enrichedError);

    expect(graphqlError.extensions.code).toBe(
      ErrorCode.APPLICATION_INSTALLATION_FAILED,
    );

    expect(graphqlError.context).toEqual({
      universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
      operation: 'add',
    });
    expect(graphqlError.extensions.context).toBeUndefined();
    expect(
      JSON.parse(JSON.stringify(graphqlError.toJSON())),
    ).not.toHaveProperty('context');

    expect({
      name: graphqlError.name,
      message: graphqlError.message,
      extensions: {
        code: graphqlError.extensions.code,
        subCode: graphqlError.extensions.subCode,
        userFriendlyMessage: i18n._(
          graphqlError.extensions.userFriendlyMessage,
        ),
      },
    }).toMatchSnapshot();
  });
});
