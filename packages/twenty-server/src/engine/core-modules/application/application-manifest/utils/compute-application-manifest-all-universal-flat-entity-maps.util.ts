import { type Manifest } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { generateIndexForFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/generate-index-for-flat-field-metadata.util';

import { fromApplicationVariableManifestToUniversalFlatApplicationVariable } from 'src/engine/core-modules/application/application-manifest/converters/from-application-variable-manifest-to-universal-flat-application-variable.util';
import { fromCommandMenuItemManifestToUniversalFlatCommandMenuItem } from 'src/engine/core-modules/application/application-manifest/converters/from-command-menu-item-manifest-to-universal-flat-command-menu-item.util';
import { fromConnectionProviderManifestToUniversalFlatConnectionProvider } from 'src/engine/core-modules/application/application-manifest/converters/from-connection-provider-manifest-to-universal-flat-connection-provider.util';
import { fromFieldManifestToUniversalFlatFieldMetadata } from 'src/engine/core-modules/application/application-manifest/converters/from-field-manifest-to-universal-flat-field-metadata.util';
import { fromFieldPermissionManifestToUniversalFlatFieldPermission } from 'src/engine/core-modules/application/application-manifest/converters/from-field-permission-manifest-to-universal-flat-field-permission.util';
import { fromFrontComponentManifestToUniversalFlatFrontComponent } from 'src/engine/core-modules/application/application-manifest/converters/from-front-component-manifest-to-universal-flat-front-component.util';
import { fromLogicFunctionManifestToUniversalFlatLogicFunction } from 'src/engine/core-modules/application/application-manifest/converters/from-logic-function-manifest-to-universal-flat-logic-function.util';
import { fromNavigationMenuItemManifestToUniversalFlatNavigationMenuItem } from 'src/engine/core-modules/application/application-manifest/converters/from-navigation-menu-item-manifest-to-universal-flat-navigation-menu-item.util';
import { fromObjectManifestToUniversalFlatObjectMetadata } from 'src/engine/core-modules/application/application-manifest/converters/from-object-manifest-to-universal-flat-object-metadata.util';
import { fromObjectPermissionManifestToUniversalFlatObjectPermission } from 'src/engine/core-modules/application/application-manifest/converters/from-object-permission-manifest-to-universal-flat-object-permission.util';
import { fromPageLayoutManifestToUniversalFlatPageLayout } from 'src/engine/core-modules/application/application-manifest/converters/from-page-layout-manifest-to-universal-flat-page-layout.util';
import { fromPageLayoutTabManifestToUniversalFlatPageLayoutTab } from 'src/engine/core-modules/application/application-manifest/converters/from-page-layout-tab-manifest-to-universal-flat-page-layout-tab.util';
import { fromPageLayoutWidgetManifestToUniversalFlatPageLayoutWidget } from 'src/engine/core-modules/application/application-manifest/converters/from-page-layout-widget-manifest-to-universal-flat-page-layout-widget.util';
import { fromPermissionFlagToUniversalFlatPermissionFlag } from 'src/engine/core-modules/application/application-manifest/converters/from-permission-flag-to-universal-flat-permission-flag.util';
import { fromRoleManifestToUniversalFlatRole } from 'src/engine/core-modules/application/application-manifest/converters/from-role-manifest-to-universal-flat-role.util';
import { fromSkillManifestToUniversalFlatSkill } from 'src/engine/core-modules/application/application-manifest/converters/from-skill-manifest-to-universal-flat-skill.util';
import { computeSearchVectorUniversalSettingsFromObjectManifest } from 'src/engine/core-modules/application/application-manifest/utils/compute-search-vector-universal-settings-from-object-manifest.util';
import { fromViewFieldGroupManifestToUniversalFlatViewFieldGroup } from 'src/engine/core-modules/application/application-manifest/converters/from-view-field-group-manifest-to-universal-flat-view-field-group.util';
import { fromViewFieldManifestToUniversalFlatViewField } from 'src/engine/core-modules/application/application-manifest/converters/from-view-field-manifest-to-universal-flat-view-field.util';
import { fromViewFilterGroupManifestToUniversalFlatViewFilterGroup } from 'src/engine/core-modules/application/application-manifest/converters/from-view-filter-group-manifest-to-universal-flat-view-filter-group.util';
import { fromViewFilterManifestToUniversalFlatViewFilter } from 'src/engine/core-modules/application/application-manifest/converters/from-view-filter-manifest-to-universal-flat-view-filter.util';
import { fromViewGroupManifestToUniversalFlatViewGroup } from 'src/engine/core-modules/application/application-manifest/converters/from-view-group-manifest-to-universal-flat-view-group.util';
import { fromViewManifestToUniversalFlatView } from 'src/engine/core-modules/application/application-manifest/converters/from-view-manifest-to-universal-flat-view.util';
import { fromViewSortManifestToUniversalFlatViewSort } from 'src/engine/core-modules/application/application-manifest/converters/from-view-sort-manifest-to-universal-flat-view-sort.util';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { fromAgentManifestToUniversalFlatAgent } from 'src/engine/core-modules/application/utils/from-agent-manifest-to-universal-flat-agent.util';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/add-universal-flat-entity-to-universal-flat-entity-maps-through-mutation-or-throw.util';

export const computeApplicationManifestAllUniversalFlatEntityMaps = ({
  manifest,
  ownerFlatApplication,
  now,
}: {
  manifest: Manifest;
  ownerFlatApplication: FlatApplication;
  now: string;
}): AllFlatEntityMaps => {
  const allUniversalFlatEntityMaps = createEmptyAllFlatEntityMaps();

  const { universalIdentifier: applicationUniversalIdentifier } =
    ownerFlatApplication;

  for (const objectManifest of manifest.objects) {
    const flatObjectMetadata = fromObjectManifestToUniversalFlatObjectMetadata({
      objectManifest,
      applicationUniversalIdentifier,
      now,
    });

    addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
      universalFlatEntity: flatObjectMetadata,
      universalFlatEntityMapsToMutate:
        allUniversalFlatEntityMaps.flatObjectMetadataMaps,
    });

    for (const fieldManifest of objectManifest.fields) {
      const enrichedFieldManifest =
        fieldManifest.type === FieldMetadataType.TS_VECTOR &&
        !isDefined(fieldManifest.universalSettings)
          ? {
              ...fieldManifest,
              objectUniversalIdentifier: objectManifest.universalIdentifier,
              universalSettings:
                computeSearchVectorUniversalSettingsFromObjectManifest({
                  objectManifest,
                }),
            }
          : {
              ...fieldManifest,
              objectUniversalIdentifier: objectManifest.universalIdentifier,
            };

      const flatFieldMetadata = fromFieldManifestToUniversalFlatFieldMetadata({
        fieldManifest: enrichedFieldManifest,
        applicationUniversalIdentifier,
        now,
      });

      addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
        universalFlatEntity: flatFieldMetadata,
        universalFlatEntityMapsToMutate:
          allUniversalFlatEntityMaps.flatFieldMetadataMaps,
      });

      if (flatFieldMetadata.isUnique) {
        addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
          universalFlatEntity: generateIndexForFlatFieldMetadata({
            flatFieldMetadata,
            flatObjectMetadata,
          }),
          universalFlatEntityMapsToMutate:
            allUniversalFlatEntityMaps.flatIndexMaps,
        });
      }
    }
  }

  for (const fieldManifest of manifest.fields) {
    const flatFieldMetadata = fromFieldManifestToUniversalFlatFieldMetadata({
      fieldManifest: fieldManifest,
      applicationUniversalIdentifier,
      now,
    });

    addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
      universalFlatEntity: flatFieldMetadata,
      universalFlatEntityMapsToMutate:
        allUniversalFlatEntityMaps.flatFieldMetadataMaps,
    });

    if (flatFieldMetadata.isUnique) {
      const flatObjectMetadata =
        allUniversalFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier[
          flatFieldMetadata.objectMetadataUniversalIdentifier
        ];

      if (isDefined(flatObjectMetadata)) {
        addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
          universalFlatEntity: generateIndexForFlatFieldMetadata({
            flatFieldMetadata,
            flatObjectMetadata,
          }),
          universalFlatEntityMapsToMutate:
            allUniversalFlatEntityMaps.flatIndexMaps,
        });
      }
    }
  }

  for (const logicFunctionManifest of manifest.logicFunctions) {
    addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
      universalFlatEntity:
        fromLogicFunctionManifestToUniversalFlatLogicFunction({
          logicFunctionManifest,
          applicationUniversalIdentifier,
          now,
        }),
      universalFlatEntityMapsToMutate:
        allUniversalFlatEntityMaps.flatLogicFunctionMaps,
    });
  }

  for (const frontComponentManifest of manifest.frontComponents) {
    addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
      universalFlatEntity:
        fromFrontComponentManifestToUniversalFlatFrontComponent({
          frontComponentManifest,
          applicationUniversalIdentifier,
          now,
        }),
      universalFlatEntityMapsToMutate:
        allUniversalFlatEntityMaps.flatFrontComponentMaps,
    });
  }

  for (const connectionProviderManifest of manifest.connectionProviders ?? []) {
    addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
      universalFlatEntity:
        fromConnectionProviderManifestToUniversalFlatConnectionProvider({
          connectionProviderManifest,
          applicationUniversalIdentifier,
          now,
        }),
      universalFlatEntityMapsToMutate:
        allUniversalFlatEntityMaps.flatConnectionProviderMaps,
    });
  }

  for (const roleManifest of manifest.roles) {
    addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
      universalFlatEntity: fromRoleManifestToUniversalFlatRole({
        roleManifest,
        applicationUniversalIdentifier,
        now,
      }),
      universalFlatEntityMapsToMutate: allUniversalFlatEntityMaps.flatRoleMaps,
    });
    for (const objectPermissionManifest of roleManifest.objectPermissions ??
      []) {
      addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
        universalFlatEntity:
          fromObjectPermissionManifestToUniversalFlatObjectPermission({
            objectPermissionManifest,
            roleUniversalIdentifier: roleManifest.universalIdentifier,
            applicationUniversalIdentifier,
            now,
          }),
        universalFlatEntityMapsToMutate:
          allUniversalFlatEntityMaps.flatObjectPermissionMaps,
      });
    }

    for (const fieldPermissionManifest of roleManifest.fieldPermissions ?? []) {
      addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
        universalFlatEntity:
          fromFieldPermissionManifestToUniversalFlatFieldPermission({
            fieldPermissionManifest,
            roleUniversalIdentifier: roleManifest.universalIdentifier,
            applicationUniversalIdentifier,
            now,
          }),
        universalFlatEntityMapsToMutate:
          allUniversalFlatEntityMaps.flatFieldPermissionMaps,
      });
    }

    for (const permissionFlag of roleManifest.permissionFlags ?? []) {
      addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
        universalFlatEntity: fromPermissionFlagToUniversalFlatPermissionFlag({
          permissionFlag,
          roleUniversalIdentifier: roleManifest.universalIdentifier,
          applicationUniversalIdentifier,
          now,
        }),
        universalFlatEntityMapsToMutate:
          allUniversalFlatEntityMaps.flatPermissionFlagMaps,
      });
    }
  }

  for (const skillManifest of manifest.skills ?? []) {
    addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
      universalFlatEntity: fromSkillManifestToUniversalFlatSkill({
        skillManifest,
        applicationUniversalIdentifier,
        now,
      }),
      universalFlatEntityMapsToMutate: allUniversalFlatEntityMaps.flatSkillMaps,
    });
  }

  for (const agentManifest of manifest.agents ?? []) {
    addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
      universalFlatEntity: fromAgentManifestToUniversalFlatAgent({
        agentManifest,
        applicationUniversalIdentifier,
        now,
      }),
      universalFlatEntityMapsToMutate: allUniversalFlatEntityMaps.flatAgentMaps,
    });
  }

  for (const viewManifest of manifest.views ?? []) {
    addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
      universalFlatEntity: fromViewManifestToUniversalFlatView({
        viewManifest,
        applicationUniversalIdentifier,
        now,
      }),
      universalFlatEntityMapsToMutate: allUniversalFlatEntityMaps.flatViewMaps,
    });

    for (const viewFieldGroupManifest of viewManifest.fieldGroups ?? []) {
      addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
        universalFlatEntity:
          fromViewFieldGroupManifestToUniversalFlatViewFieldGroup({
            viewFieldGroupManifest,
            viewUniversalIdentifier: viewManifest.universalIdentifier,
            applicationUniversalIdentifier,
            now,
          }),
        universalFlatEntityMapsToMutate:
          allUniversalFlatEntityMaps.flatViewFieldGroupMaps,
      });
    }

    for (const viewFieldManifest of viewManifest.fields ?? []) {
      addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
        universalFlatEntity: fromViewFieldManifestToUniversalFlatViewField({
          viewFieldManifest,
          viewUniversalIdentifier: viewManifest.universalIdentifier,
          applicationUniversalIdentifier,
          now,
        }),
        universalFlatEntityMapsToMutate:
          allUniversalFlatEntityMaps.flatViewFieldMaps,
      });
    }

    for (const viewFilterGroupManifest of viewManifest.filterGroups ?? []) {
      addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
        universalFlatEntity:
          fromViewFilterGroupManifestToUniversalFlatViewFilterGroup({
            viewFilterGroupManifest,
            viewUniversalIdentifier: viewManifest.universalIdentifier,
            applicationUniversalIdentifier,
            now,
          }),
        universalFlatEntityMapsToMutate:
          allUniversalFlatEntityMaps.flatViewFilterGroupMaps,
      });
    }

    for (const viewFilterManifest of viewManifest.filters ?? []) {
      addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
        universalFlatEntity: fromViewFilterManifestToUniversalFlatViewFilter({
          viewFilterManifest,
          viewUniversalIdentifier: viewManifest.universalIdentifier,
          applicationUniversalIdentifier,
          now,
        }),
        universalFlatEntityMapsToMutate:
          allUniversalFlatEntityMaps.flatViewFilterMaps,
      });
    }

    for (const viewGroupManifest of viewManifest.groups ?? []) {
      addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
        universalFlatEntity: fromViewGroupManifestToUniversalFlatViewGroup({
          viewGroupManifest,
          viewUniversalIdentifier: viewManifest.universalIdentifier,
          applicationUniversalIdentifier,
          now,
        }),
        universalFlatEntityMapsToMutate:
          allUniversalFlatEntityMaps.flatViewGroupMaps,
      });
    }

    for (const viewSortManifest of viewManifest.sorts ?? []) {
      addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
        universalFlatEntity: fromViewSortManifestToUniversalFlatViewSort({
          viewSortManifest,
          viewUniversalIdentifier: viewManifest.universalIdentifier,
          applicationUniversalIdentifier,
          now,
        }),
        universalFlatEntityMapsToMutate:
          allUniversalFlatEntityMaps.flatViewSortMaps,
      });
    }
  }

  for (const navigationMenuItemManifest of manifest.navigationMenuItems ?? []) {
    addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
      universalFlatEntity:
        fromNavigationMenuItemManifestToUniversalFlatNavigationMenuItem({
          navigationMenuItemManifest,
          applicationUniversalIdentifier,
          now,
        }),
      universalFlatEntityMapsToMutate:
        allUniversalFlatEntityMaps.flatNavigationMenuItemMaps,
    });
  }

  for (const pageLayoutManifest of manifest.pageLayouts ?? []) {
    addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
      universalFlatEntity: fromPageLayoutManifestToUniversalFlatPageLayout({
        pageLayoutManifest,
        applicationUniversalIdentifier,
        now,
      }),
      universalFlatEntityMapsToMutate:
        allUniversalFlatEntityMaps.flatPageLayoutMaps,
    });

    for (const pageLayoutTabManifest of pageLayoutManifest.tabs ?? []) {
      addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
        universalFlatEntity:
          fromPageLayoutTabManifestToUniversalFlatPageLayoutTab({
            pageLayoutTabManifest,
            pageLayoutUniversalIdentifier:
              pageLayoutManifest.universalIdentifier,
            applicationUniversalIdentifier,
            now,
          }),
        universalFlatEntityMapsToMutate:
          allUniversalFlatEntityMaps.flatPageLayoutTabMaps,
      });

      for (const pageLayoutWidgetManifest of pageLayoutTabManifest.widgets ??
        []) {
        addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
          universalFlatEntity:
            fromPageLayoutWidgetManifestToUniversalFlatPageLayoutWidget({
              pageLayoutWidgetManifest,
              pageLayoutTabUniversalIdentifier:
                pageLayoutTabManifest.universalIdentifier,
              applicationUniversalIdentifier,
              now,
            }),
          universalFlatEntityMapsToMutate:
            allUniversalFlatEntityMaps.flatPageLayoutWidgetMaps,
        });
      }
    }
  }

  for (const pageLayoutTabManifest of manifest.pageLayoutTabs ?? []) {
    if (!isDefined(pageLayoutTabManifest.pageLayoutUniversalIdentifier)) {
      throw new Error(
        `Top-level pageLayoutTab "${pageLayoutTabManifest.universalIdentifier}" is missing required pageLayoutUniversalIdentifier`,
      );
    }

    addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
      universalFlatEntity:
        fromPageLayoutTabManifestToUniversalFlatPageLayoutTab({
          pageLayoutTabManifest,
          pageLayoutUniversalIdentifier:
            pageLayoutTabManifest.pageLayoutUniversalIdentifier,
          applicationUniversalIdentifier,
          now,
        }),
      universalFlatEntityMapsToMutate:
        allUniversalFlatEntityMaps.flatPageLayoutTabMaps,
    });

    for (const pageLayoutWidgetManifest of pageLayoutTabManifest.widgets ??
      []) {
      addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
        universalFlatEntity:
          fromPageLayoutWidgetManifestToUniversalFlatPageLayoutWidget({
            pageLayoutWidgetManifest,
            pageLayoutTabUniversalIdentifier:
              pageLayoutTabManifest.universalIdentifier,
            applicationUniversalIdentifier,
            now,
          }),
        universalFlatEntityMapsToMutate:
          allUniversalFlatEntityMaps.flatPageLayoutWidgetMaps,
      });
    }
  }

  for (const [key, applicationVariableManifest] of Object.entries(
    manifest.application.applicationVariables ?? {},
  )) {
    addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
      universalFlatEntity:
        fromApplicationVariableManifestToUniversalFlatApplicationVariable({
          key,
          universalIdentifier: applicationVariableManifest.universalIdentifier,
          value:
            'value' in applicationVariableManifest
              ? applicationVariableManifest.value
              : undefined,
          description: applicationVariableManifest.description,
          isSecret: applicationVariableManifest.isSecret,
          applicationUniversalIdentifier,
          now,
        }),
      universalFlatEntityMapsToMutate:
        allUniversalFlatEntityMaps.flatApplicationVariableMaps,
    });
  }

  for (const commandMenuItemManifest of manifest.commandMenuItems ?? []) {
    if (!isDefined(commandMenuItemManifest.frontComponentUniversalIdentifier)) {
      throw new Error(
        `Top-level commandMenuItem "${commandMenuItemManifest.universalIdentifier}" is missing required frontComponentUniversalIdentifier`,
      );
    }

    addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
      universalFlatEntity:
        fromCommandMenuItemManifestToUniversalFlatCommandMenuItem({
          commandMenuItemManifest,
          applicationUniversalIdentifier,
          now,
        }),
      universalFlatEntityMapsToMutate:
        allUniversalFlatEntityMaps.flatCommandMenuItemMaps,
    });
  }

  return allUniversalFlatEntityMaps;
};
