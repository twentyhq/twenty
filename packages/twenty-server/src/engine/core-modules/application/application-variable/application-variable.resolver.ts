import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Parent, ResolveField } from '@nestjs/graphql';

import { GraphQLJSON } from 'graphql-type-json';
import { type ApplicationVariableOption } from 'twenty-shared/application';
import { PermissionFlagType } from 'twenty-shared/constants';
import { assertIsDefinedOrThrow, isNonEmptyArray } from 'twenty-shared/utils';

import { ApplicationExceptionFilter } from 'src/engine/core-modules/application/application-exception-filter';
import { ApplicationVariableEntityExceptionFilter } from 'src/engine/core-modules/application/application-variable/application-variable-exception-filter';
import { ApplicationVariableEntity } from 'src/engine/core-modules/application/application-variable/application-variable.entity';
import { ApplicationVariableEntityService } from 'src/engine/core-modules/application/application-variable/application-variable.service';
import { ApplicationVariableEntityDTO } from 'src/engine/core-modules/application/application-variable/dtos/application-variable.dto';
import { UpdateApplicationVariableEntityInput } from 'src/engine/core-modules/application/application-variable/dtos/update-application-variable.input';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { resolveTargetApplicationOrThrow } from 'src/engine/core-modules/application/utils/resolve-target-application-or-throw.util';
import { type I18nContext } from 'src/engine/core-modules/i18n/types/i18n-context.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthApplication } from 'src/engine/decorators/auth/auth-application.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { type IDataloaders } from 'src/engine/dataloaders/dataloader.interface';
import { ApplicationTranslationCatalogService } from 'src/engine/metadata-modules/application-translation-catalog/services/application-translation-catalog.service';
import { resolveEffectiveManifestMessage } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-entity-property.util';

@UseGuards(
  AuthPrincipalGuard({
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: true,
    oauthClient: true,
    application: true,
  }),
  SettingsPermissionGuard(PermissionFlagType.APPLICATIONS),
)
@MetadataResolver(() => ApplicationVariableEntityDTO)
@UseFilters(
  ApplicationVariableEntityExceptionFilter,
  ApplicationExceptionFilter,
  AuthGraphqlApiExceptionFilter,
)
export class ApplicationVariableEntityResolver {
  constructor(
    private readonly applicationVariableService: ApplicationVariableEntityService,
    private readonly applicationTranslationCatalogService: ApplicationTranslationCatalogService,
  ) {}

  @ResolveField(() => String)
  value(@Parent() applicationVariable: ApplicationVariableEntity): string {
    return this.applicationVariableService.getDisplayValue(applicationVariable);
  }

  @ResolveField(() => String)
  async label(
    @Parent()
    applicationVariable: Pick<
      ApplicationVariableEntity,
      'label' | 'applicationId'
    >,
    @Context() context: { loaders: IDataloaders } & I18nContext,
    @AuthWorkspace({ allowUndefined: true })
    workspace: WorkspaceEntity | undefined,
  ): Promise<string> {
    return this.applicationTranslationCatalogService.resolveManifestMessage({
      entity: 'applicationVariable',
      property: 'label',
      sourceValue: applicationVariable.label,
      applicationId: applicationVariable.applicationId,
      loaders: context.loaders,
      locale: context.req.locale,
      workspaceId: workspace?.id,
    });
  }

  @ResolveField(() => String)
  async description(
    @Parent()
    applicationVariable: Pick<
      ApplicationVariableEntity,
      'description' | 'applicationId'
    >,
    @Context() context: { loaders: IDataloaders } & I18nContext,
    @AuthWorkspace({ allowUndefined: true })
    workspace: WorkspaceEntity | undefined,
  ): Promise<string> {
    return this.applicationTranslationCatalogService.resolveManifestMessage({
      entity: 'applicationVariable',
      property: 'description',
      sourceValue: applicationVariable.description,
      applicationId: applicationVariable.applicationId,
      loaders: context.loaders,
      locale: context.req.locale,
      workspaceId: workspace?.id,
    });
  }

  @ResolveField(() => GraphQLJSON, { nullable: true })
  async options(
    @Parent()
    applicationVariable: Pick<
      ApplicationVariableEntity,
      'options' | 'applicationId'
    >,
    @Context() context: { loaders: IDataloaders } & I18nContext,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ApplicationVariableOption[] | null | undefined> {
    if (!isNonEmptyArray(applicationVariable.options)) {
      return applicationVariable.options;
    }

    const i18nContext =
      await this.applicationTranslationCatalogService.buildEffectiveEntityI18nContext(
        {
          applicationId: applicationVariable.applicationId,
          loaders: context.loaders,
          locale: context.req.locale,
          workspaceId,
        },
      );

    return applicationVariable.options.map((option) => ({
      ...option,
      label: resolveEffectiveManifestMessage({
        entity: 'applicationVariable',
        property: 'options.*.label',
        sourceValue: option.label,
        i18nContext,
      }),
    }));
  }

  @Mutation(() => Boolean)
  async updateOneApplicationVariable(
    @Args() { key, value, applicationId }: UpdateApplicationVariableEntityInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthApplication({ allowUndefined: true })
    callingApplication: FlatApplication | undefined,
  ) {
    const { targetApplicationId } = resolveTargetApplicationOrThrow({
      callingApplication,
      applicationId,
    });

    // Without a universal identifier the lookup always carries an id
    assertIsDefinedOrThrow(targetApplicationId);

    await this.applicationVariableService.update({
      key,
      plainTextValue: value,
      applicationId: targetApplicationId,
      workspaceId,
    });

    return true;
  }
}
