import { type Manifest } from 'twenty-shared/application';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { fromCommandMenuItemManifestToUniversalFlatCommandMenuItem } from 'src/engine/core-modules/application/utils/from-command-menu-item-manifest-to-universal-flat-command-menu-item.util';
import { fromFieldManifestToUniversalFlatFieldMetadata } from 'src/engine/core-modules/application/utils/from-field-manifest-to-universal-flat-field-metadata.util';
import { fromFrontComponentManifestToUniversalFlatFrontComponent } from 'src/engine/core-modules/application/utils/from-front-component-manifest-to-universal-flat-front-component.util';
import { fromLogicFunctionManifestToUniversalFlatLogicFunction } from 'src/engine/core-modules/application/utils/from-logic-function-manifest-to-universal-flat-logic-function.util';
import { fromNavigationMenuItemManifestToUniversalFlatNavigationMenuItem } from 'src/engine/core-modules/application/utils/from-navigation-menu-item-manifest-to-universal-flat-navigation-menu-item.util';
import { fromObjectManifestToUniversalFlatObjectMetadata } from 'src/engine/core-modules/application/utils/from-object-manifest-to-universal-flat-object-metadata.util';
import { fromPageLayoutManifestToUniversalFlatPageLayout } from 'src/engine/core-modules/application/utils/from-page-layout-manifest-to-universal-flat-page-layout.util';
import { fromPageLayoutTabManifestToUniversalFlatPageLayoutTab } from 'src/engine/core-modules/application/utils/from-page-layout-tab-manifest-to-universal-flat-page-layout-tab.util';
import { fromPageLayoutWidgetManifestToUniversalFlatPageLayoutWidget } from 'src/engine/core-modules/application/utils/from-page-layout-widget-manifest-to-universal-flat-page-layout-widget.util';
import { fromRoleManifestToUniversalFlatRole } from 'src/engine/core-modules/application/utils/from-role-manifest-to-universal-flat-role.util';
import { fromSkillManifestToUniversalFlatSkill } from 'src/engine/core-modules/application/utils/from-skill-manifest-to-universal-flat-skill.util';
import { fromViewFieldGroupManifestToUniversalFlatViewFieldGroup } from 'src/engine/core-modules/application/utils/from-view-field-group-manifest-to-universal-flat-view-field-group.util';
import { fromViewFieldManifestToUniversalFlatViewField } from 'src/engine/core-modules/application/utils/from-view-field-manifest-to-universal-flat-view-field.util';
import { fromViewFilterGroupManifestToUniversalFlatViewFilterGroup } from 'src/engine/core-modules/application/utils/from-view-filter-group-manifest-to-universal-flat-view-filter-group.util';
import { fromViewFilterManifestToUniversalFlatViewFilter } from 'src/engine/core-modules/application/utils/from-view-filter-manifest-to-universal-flat-view-filter.util';
import { fromViewGroupManifestToUniversalFlatViewGroup } from 'src/engine/core-modules/application/utils/from-view-group-manifest-to-universal-flat-view-group.util';
import { fromViewManifestToUniversalFlatView } from 'src/engine/core-modules/application/utils/from-view-manifest-to-universal-flat-view.util';
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
    addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
      universalFlatEntity: fromObjectManifestToUniversalFlatObjectMetadata({
        objectManifest,
        applicationUniversalIdentifier,
        now,
      }),
      universalFlatEntityMapsToMutate:
        allUniversalFlatEntityMaps.flatObjectMetadataMaps,
    });

    for (const fieldManifest of objectManifest.fields) {
      addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
        universalFlatEntity: fromFieldManifestToUniversalFlatFieldMetadata({
          fieldManifest: {
            ...fieldManifest,
            objectUniversalIdentifier: objectManifest.universalIdentifier,
          },
          applicationUniversalIdentifier,
          now,
        }),
        universalFlatEntityMapsToMutate:
          allUniversalFlatEntityMaps.flatFieldMetadataMaps,
      });
    }
  }

  for (const fieldManifest of manifest.fields) {
    addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
      universalFlatEntity: fromFieldManifestToUniversalFlatFieldMetadata({
        fieldManifest: fieldManifest,
        applicationUniversalIdentifier,
        now,
      }),
      universalFlatEntityMapsToMutate:
        allUniversalFlatEntityMaps.flatFieldMetadataMaps,
    });
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

    if (frontComponentManifest.command) {
      addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
        universalFlatEntity:
          fromCommandMenuItemManifestToUniversalFlatCommandMenuItem({
            commandMenuItemManifest: {
              ...frontComponentManifest.command,
              frontComponentUniversalIdentifier:
                frontComponentManifest.universalIdentifier,
            },
            applicationUniversalIdentifier,
            now,
          }),
        universalFlatEntityMapsToMutate:
          allUniversalFlatEntityMaps.flatCommandMenuItemMaps,
      });
    }
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
  }

  for (const skillManifest of manifest.skills ?? []) {
    addUniversalFlatEntityToUniversalFlatEntityAndRelatedEntityMapsThroughMutationOrThrow(
      {
        metadataName: 'skill',
        universalFlatEntity: fromSkillManifestToUniversalFlatSkill({
          skillManifest,
          applicationUniversalIdentifier,
          now,
        }),
        universalFlatEntityAndRelatedMapsToMutate: allUniversalFlatEntityMaps,
      },
    );
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

  return allUniversalFlatEntityMaps;
};
