import { CommonQueryRunnerException } from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { alignQueryRunnerContextWithWorkspaceContext } from 'src/engine/api/common/common-query-runners/utils/align-query-runner-context-with-workspace-context.util';
import { type CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  workspaceContextStorage,
  type ORMWorkspaceContext,
} from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';

const COMPANY_UNIVERSAL_IDENTIFIER = 'company-universal-identifier';

const buildFlatObjectMetadata = (
  overrides: Partial<FlatObjectMetadata> = {},
): FlatObjectMetadata =>
  ({
    id: 'company-id',
    universalIdentifier: COMPANY_UNIVERSAL_IDENTIFIER,
    nameSingular: 'company',
    fieldIds: [],
    ...overrides,
  }) as FlatObjectMetadata;

const buildFlatEntityMaps = (byUniversalIdentifier: object) =>
  ({
    byUniversalIdentifier,
    universalIdentifierById: {},
    universalIdentifiersByApplicationId: {},
  }) as never;

const buildCallerContext = (
  flatObjectMetadata: FlatObjectMetadata,
): CommonBaseQueryRunnerContext =>
  ({
    authContext: { workspace: { id: 'workspace-id' } },
    flatObjectMetadata,
    flatObjectMetadataMaps: buildFlatEntityMaps({
      [COMPANY_UNIVERSAL_IDENTIFIER]: flatObjectMetadata,
    }),
    flatFieldMetadataMaps: buildFlatEntityMaps({ caller: true }),
    flatIndexMaps: buildFlatEntityMaps({ caller: true }),
    objectIdByNameSingular: { company: 'company-id' },
    rolePermissionConfig: { roleId: 'role-id' },
  }) as unknown as CommonBaseQueryRunnerContext;

const buildWorkspaceContext = (
  flatObjectMetadata?: FlatObjectMetadata,
): ORMWorkspaceContext =>
  ({
    flatObjectMetadataMaps: buildFlatEntityMaps(
      flatObjectMetadata
        ? { [COMPANY_UNIVERSAL_IDENTIFIER]: flatObjectMetadata }
        : {},
    ),
    flatFieldMetadataMaps: buildFlatEntityMaps({ workspaceContext: true }),
    flatIndexMaps: buildFlatEntityMaps({ workspaceContext: true }),
    objectIdByNameSingular: { company: 'company-id' },
  }) as unknown as ORMWorkspaceContext;

const alignInWorkspaceContext = (
  workspaceContext: ORMWorkspaceContext,
  queryRunnerContext: CommonBaseQueryRunnerContext,
) =>
  workspaceContextStorage.run(workspaceContext, () =>
    alignQueryRunnerContextWithWorkspaceContext(queryRunnerContext),
  );

describe('alignQueryRunnerContextWithWorkspaceContext', () => {
  it('should replace the caller metadata maps with the ones from the workspace context', () => {
    const callerContext = buildCallerContext(
      buildFlatObjectMetadata({ fieldIds: ['stale-field-id'] }),
    );
    const workspaceContextObjectMetadata = buildFlatObjectMetadata({
      fieldIds: ['stale-field-id', 'last-contact-at-field-id'],
    });
    const workspaceContext = buildWorkspaceContext(
      workspaceContextObjectMetadata,
    );

    const alignedContext = alignInWorkspaceContext(
      workspaceContext,
      callerContext,
    );

    expect(alignedContext.flatObjectMetadata).toBe(
      workspaceContextObjectMetadata,
    );
    expect(alignedContext.flatObjectMetadataMaps).toBe(
      workspaceContext.flatObjectMetadataMaps,
    );
    expect(alignedContext.flatFieldMetadataMaps).toBe(
      workspaceContext.flatFieldMetadataMaps,
    );
    expect(alignedContext.flatIndexMaps).toBe(workspaceContext.flatIndexMaps);
  });

  it('should keep the caller properties that are not metadata related', () => {
    const callerContext = buildCallerContext(buildFlatObjectMetadata());
    const workspaceContext = buildWorkspaceContext(buildFlatObjectMetadata());

    const alignedContext = alignInWorkspaceContext(
      workspaceContext,
      callerContext,
    );

    expect(alignedContext.authContext).toBe(callerContext.authContext);
    expect(alignedContext.rolePermissionConfig).toBe(
      callerContext.rolePermissionConfig,
    );
  });

  it('should throw when the object is missing from the workspace context', () => {
    const callerContext = buildCallerContext(buildFlatObjectMetadata());
    const workspaceContext = buildWorkspaceContext();

    expect(() =>
      alignInWorkspaceContext(workspaceContext, callerContext),
    ).toThrow(CommonQueryRunnerException);
  });
});
