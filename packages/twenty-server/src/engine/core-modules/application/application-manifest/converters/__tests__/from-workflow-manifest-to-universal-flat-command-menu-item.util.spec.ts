import { type WorkflowManifest } from 'twenty-shared/application';
import { CommandMenuItemAvailabilityType } from 'twenty-shared/types';

import { fromWorkflowManifestToUniversalFlatCommandMenuItem } from 'src/engine/core-modules/application/application-manifest/converters/from-workflow-manifest-to-universal-flat-command-menu-item.util';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';

const OBJECT_ID = '99999999-9999-4999-8999-999999999999';
const VERSION_ID = '88888888-8888-4888-8888-888888888888';

const manifestWithTriggerSettings = (
  settings?: Extract<
    WorkflowManifest['version']['trigger'],
    { type: 'MANUAL' }
  >['settings'],
): WorkflowManifest => ({
  universalIdentifier: '11111111-1111-4111-8111-111111111111',
  name: 'Escalate ticket',
  version: {
    trigger: {
      universalIdentifier: '33333333-3333-4333-8333-333333333333',
      type: 'MANUAL',
      nextStepIds: ['44444444-4444-4444-8444-444444444444'],
      ...(settings ? { settings } : {}),
    },
    steps: [
      {
        universalIdentifier: '44444444-4444-4444-8444-444444444444',
        name: 'Done',
        type: 'EMPTY',
        input: {},
        nextStepIds: [],
      },
    ],
  },
});

const build = (manifest: WorkflowManifest) =>
  fromWorkflowManifestToUniversalFlatCommandMenuItem({
    manifest,
    applicationUniversalIdentifier: '66666666-6666-4666-8666-666666666666',
    coreWorkflowVersionId: VERSION_ID,
    now: '2026-10-09T10:00:00.000Z',
  });

describe('fromWorkflowManifestToUniversalFlatCommandMenuItem', () => {
  it('creates no command menu item when the trigger declares no availability', () => {
    expect(build(manifestWithTriggerSettings())).toBeNull();
    expect(build(manifestWithTriggerSettings({ icon: 'IconBolt' }))).toBeNull();
  });

  it('starts the workflow version from record selection on the declared object', () => {
    expect(
      build(
        manifestWithTriggerSettings({
          availability: {
            type: 'BULK_RECORDS',
            objectUniversalIdentifier: OBJECT_ID,
          },
          icon: 'IconBolt',
          isPinned: true,
        }),
      ),
    ).toMatchObject({
      label: 'Escalate ticket',
      icon: 'IconBolt',
      isPinned: true,
      engineComponentKey: EngineComponentKey.TRIGGER_WORKFLOW_VERSION,
      coreWorkflowVersionId: VERSION_ID,
      workflowVersionId: null,
      availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
      availabilityObjectMetadataUniversalIdentifier: OBJECT_ID,
    });
  });

  it('makes a globally available workflow available everywhere', () => {
    expect(
      build(manifestWithTriggerSettings({ availability: { type: 'GLOBAL' } })),
    ).toMatchObject({
      availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
      availabilityObjectMetadataUniversalIdentifier: null,
      isPinned: false,
    });
  });
});
