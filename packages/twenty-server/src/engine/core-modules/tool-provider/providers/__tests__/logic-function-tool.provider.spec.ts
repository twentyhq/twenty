import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { LogicFunctionToolProvider } from 'src/engine/core-modules/tool-provider/providers/logic-function-tool.provider';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFrontComponent } from 'src/engine/metadata-modules/flat-front-component/types/flat-front-component.type';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';

const workspaceId = 'workspace-id';
const roleId = 'role-id';

const FRONT_COMPONENT_UNIVERSAL_IDENTIFIER = 'invoice-preview-component';
const FRONT_COMPONENT_ID = 'front-component-id';

const createFlatLogicFunction = (
  overrides: Partial<FlatLogicFunction> & Pick<FlatLogicFunction, 'name'>,
) =>
  ({
    id: `${overrides.name}-id`,
    universalIdentifier: overrides.name,
    description: null,
    deletedAt: null,
    toolTriggerSettings: {},
    ...overrides,
  }) as FlatLogicFunction;

const generateDescriptors = async (
  logicFunctions: FlatLogicFunction[],
  application?: FlatApplication,
) => {
  const flatLogicFunctionMaps =
    createEmptyFlatEntityMaps() as FlatEntityMaps<FlatLogicFunction>;

  for (const logicFunction of logicFunctions) {
    flatLogicFunctionMaps.byUniversalIdentifier[
      logicFunction.universalIdentifier
    ] = logicFunction;
    flatLogicFunctionMaps.universalIdentifierById[logicFunction.id] =
      logicFunction.universalIdentifier;
  }

  const flatFrontComponentMaps =
    createEmptyFlatEntityMaps() as FlatEntityMaps<FlatFrontComponent>;

  flatFrontComponentMaps.byUniversalIdentifier[
    FRONT_COMPONENT_UNIVERSAL_IDENTIFIER
  ] = {
    id: FRONT_COMPONENT_ID,
    universalIdentifier: FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  } as FlatFrontComponent;
  flatFrontComponentMaps.universalIdentifierById[FRONT_COMPONENT_ID] =
    FRONT_COMPONENT_UNIVERSAL_IDENTIFIER;

  const flatEntityMapsCacheService = {
    getOrRecomputeManyOrAllFlatEntityMaps: jest.fn().mockResolvedValue({
      flatLogicFunctionMaps,
      flatObjectMetadataMaps: createEmptyFlatEntityMaps(),
      flatFrontComponentMaps,
    }),
  } as unknown as WorkspaceManyOrAllFlatEntityMapsCacheService;

  const provider = new LogicFunctionToolProvider(flatEntityMapsCacheService);

  return (await provider.generateDescriptors(
    {
      workspaceId,
      roleId,
      rolePermissionConfig: { unionOf: [roleId] },
      application,
    },
    { includeSchemas: false },
  )) as ToolIndexEntry[];
};

describe('LogicFunctionToolProvider', () => {
  it('should resolve the declared front component to the id the chat renders', async () => {
    const [descriptor] = await generateDescriptors([
      createFlatLogicFunction({
        name: 'generate-invoice',
        toolTriggerSettings: {
          frontComponentUniversalIdentifier:
            FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
        },
      }),
    ]);

    expect(descriptor.name).toBe('app_generate_invoice');
    expect(descriptor.frontComponentId).toBe(FRONT_COMPONENT_ID);
  });

  it('should leave the front component unset when the app declares none', async () => {
    const [descriptor] = await generateDescriptors([
      createFlatLogicFunction({ name: 'generate-invoice' }),
    ]);

    expect(descriptor.frontComponentId).toBeUndefined();
  });

  it('should leave the front component unset when the declared identifier matches nothing', async () => {
    const [descriptor] = await generateDescriptors([
      createFlatLogicFunction({
        name: 'generate-invoice',
        toolTriggerSettings: {
          frontComponentUniversalIdentifier: 'component-that-does-not-exist',
        },
      }),
    ]);

    expect(descriptor.frontComponentId).toBeUndefined();
  });

  it('should skip logic functions that are not exposed as tools', async () => {
    const descriptors = await generateDescriptors([
      createFlatLogicFunction({
        name: 'internal-helper',
        toolTriggerSettings: null,
      }),
    ]);

    expect(descriptors).toEqual([]);
  });

  it('should only expose the calling application tools to an application token', async () => {
    const logicFunctions = [
      createFlatLogicFunction({
        name: 'own-tool',
        applicationId: 'calling-application-id',
      }),
      createFlatLogicFunction({
        name: 'other-tool',
        applicationId: 'other-application-id',
      }),
    ];

    const sessionDescriptors = await generateDescriptors(logicFunctions);
    const applicationDescriptors = await generateDescriptors(logicFunctions, {
      id: 'calling-application-id',
    } as FlatApplication);

    expect(sessionDescriptors.map(({ name }) => name)).toEqual([
      'app_own_tool',
      'app_other_tool',
    ]);
    expect(applicationDescriptors.map(({ name }) => name)).toEqual([
      'app_own_tool',
    ]);
  });

  it('should expose every application tool to an OAuth-only client', async () => {
    const descriptors = await generateDescriptors(
      [
        createFlatLogicFunction({
          name: 'first-tool',
          applicationId: 'first-application-id',
        }),
        createFlatLogicFunction({
          name: 'second-tool',
          applicationId: 'second-application-id',
        }),
      ],
      {
        id: 'mcp-client-application-id',
        sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
      } as FlatApplication,
    );

    expect(descriptors.map(({ name }) => name)).toEqual([
      'app_first_tool',
      'app_second_tool',
    ]);
  });
});
