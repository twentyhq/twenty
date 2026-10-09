import {
  getWorkflowCommandMenuItemUniversalIdentifier,
  type WorkflowManifest,
} from 'twenty-shared/application';
import { CommandMenuItemAvailabilityType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { type UniversalFlatCommandMenuItem } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-command-menu-item.type';

export const fromWorkflowManifestToUniversalFlatCommandMenuItem = ({
  manifest,
  applicationUniversalIdentifier,
  coreWorkflowVersionId,
  now,
}: {
  manifest: WorkflowManifest;
  applicationUniversalIdentifier: string;
  coreWorkflowVersionId: string;
  now: string;
}): UniversalFlatCommandMenuItem | null => {
  const { trigger } = manifest.version;
  const settings = trigger.type === 'MANUAL' ? trigger.settings : undefined;
  const availability = settings?.availability;

  if (!isDefined(settings) || !isDefined(availability)) {
    return null;
  }

  const isRecordSelection = availability.type !== 'GLOBAL';

  return {
    universalIdentifier: getWorkflowCommandMenuItemUniversalIdentifier({
      applicationUniversalIdentifier,
      workflowUniversalIdentifier: manifest.universalIdentifier,
    }),
    applicationUniversalIdentifier,
    label: manifest.name,
    shortLabel: manifest.name,
    position: 0,
    icon: settings.icon ?? null,
    isPinned: settings.isPinned ?? false,
    availabilityType: isRecordSelection
      ? CommandMenuItemAvailabilityType.RECORD_SELECTION
      : CommandMenuItemAvailabilityType.GLOBAL,
    conditionalAvailabilityExpression: null,
    conditionalPinnedExpression: null,
    frontComponentUniversalIdentifier: null,
    availabilityObjectMetadataUniversalIdentifier: isRecordSelection
      ? availability.objectUniversalIdentifier
      : null,
    navigationTargetObjectMetadataUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.TRIGGER_WORKFLOW_VERSION,
    payload: null,
    hotKeys: null,
    workflowVersionId: null,
    coreWorkflowVersionId,
    pageLayoutUniversalIdentifier: null,
    isActive: true,
    isSystemSideEffect: false,
    universalOverrides: null,
    createdAt: now,
    updatedAt: now,
  };
};
