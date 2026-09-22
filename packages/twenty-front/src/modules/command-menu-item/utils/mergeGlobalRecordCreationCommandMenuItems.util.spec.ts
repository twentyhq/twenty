// oxlint-disable twenty/folder-structure -- Utility specs intentionally live beside their implementation.
import { mergeGlobalRecordCreationCommandMenuItems } from '@/command-menu-item/utils/mergeGlobalRecordCreationCommandMenuItems';
import { EngineComponentKey } from '~/generated-metadata/graphql';
import { mockedCommandMenuItems } from '~/testing/mock-data/generated/metadata/command-menu-items/mock-command-menu-items-data';

const template = mockedCommandMenuItems[0];
const pageCommand = { ...template, id: 'page', position: 20 };
const navigationCommand = {
  ...template,
  id: 'navigation',
  engineComponentKey: EngineComponentKey.NAVIGATION,
  position: 10,
};
const legacyCreationCommand = {
  ...template,
  id: 'legacy-create',
  engineComponentKey: EngineComponentKey.CREATE_NEW_RECORD,
  position: 3,
};
const commandMenuItems = [
  pageCommand,
  navigationCommand,
  legacyCreationCommand,
];
const globalRecordCreationCommandMenuItems = ['company', 'task'].map((id) => ({
  ...legacyCreationCommand,
  id: `create-${id}`,
  creationTargetObjectMetadataId: id,
}));

it('places global creation after page commands and before navigation, replacing legacy creation', () => {
  expect(
    mergeGlobalRecordCreationCommandMenuItems({
      commandMenuItems,
      globalRecordCreationCommandMenuItems,
      shouldDisplayGlobalRecordCreationCommands: true,
    }),
  ).toEqual([
    pageCommand,
    ...globalRecordCreationCommandMenuItems,
    navigationCommand,
  ]);
  expect(commandMenuItems).toEqual([
    pageCommand,
    navigationCommand,
    legacyCreationCommand,
  ]);
});

it('preserves position ordering and legacy creation when global creation is disabled', () => {
  expect(
    mergeGlobalRecordCreationCommandMenuItems({
      commandMenuItems,
      globalRecordCreationCommandMenuItems,
      shouldDisplayGlobalRecordCreationCommands: false,
    }),
  ).toEqual([legacyCreationCommand, navigationCommand, pageCommand]);
});

it('hides legacy creation even when no objects are eligible for global creation', () => {
  expect(
    mergeGlobalRecordCreationCommandMenuItems({
      commandMenuItems,
      globalRecordCreationCommandMenuItems: [],
      shouldDisplayGlobalRecordCreationCommands: true,
    }),
  ).toEqual([pageCommand, navigationCommand]);
});

it('preserves object-scoped creation when a missing template disables replacement', () => {
  const objectScopedCreationCommand = {
    ...legacyCreationCommand,
    availabilityObjectMetadataId: 'company-id',
  };

  expect(
    mergeGlobalRecordCreationCommandMenuItems({
      commandMenuItems: [pageCommand, objectScopedCreationCommand],
      globalRecordCreationCommandMenuItems: [],
      shouldDisplayGlobalRecordCreationCommands: false,
    }),
  ).toEqual([objectScopedCreationCommand, pageCommand]);
});

const pinnedCreationCommand = {
  ...legacyCreationCommand,
  isPinned: true,
  label: 'Create Company',
  shortLabel: 'Create',
  icon: 'IconPlus',
};
const companyCreationCommand = {
  ...globalRecordCreationCommandMenuItems[0],
  isPinned: false,
  label: 'Create Company',
  shortLabel: null,
  icon: 'IconBuildingSkyscraper',
};
const taskCreationCommand = {
  ...globalRecordCreationCommandMenuItems[1],
  isPinned: false,
  label: 'Create Task',
  shortLabel: null,
  icon: 'IconCheckbox',
};
const globalCreationCommands = [companyCreationCommand, taskCreationCommand];

it('pins contextual creation first and removes its duplicate from global creation', () => {
  const askAiCommand = {
    ...pageCommand,
    id: 'ask-ai',
    isPinned: true,
    position: 0,
  };
  const result = mergeGlobalRecordCreationCommandMenuItems({
    commandMenuItems: [askAiCommand, pinnedCreationCommand],
    globalRecordCreationCommandMenuItems: globalCreationCommands,
    shouldDisplayGlobalRecordCreationCommands: true,
    contextObjectMetadataId: 'company',
  });

  expect(result).toEqual([
    pinnedCreationCommand,
    askAiCommand,
    taskCreationCommand,
  ]);
  expect(result[0].creationTargetObjectMetadataId).toBeUndefined();
});

it('keeps all global creation commands when contextual creation is unavailable', () => {
  expect(
    mergeGlobalRecordCreationCommandMenuItems({
      commandMenuItems: [pageCommand],
      globalRecordCreationCommandMenuItems: globalCreationCommands,
      shouldDisplayGlobalRecordCreationCommands: true,
      contextObjectMetadataId: 'company',
    }),
  ).toEqual([pageCommand, ...globalCreationCommands]);
});

it('keeps the current object in global creation when contextual creation is unpinned', () => {
  expect(
    mergeGlobalRecordCreationCommandMenuItems({
      commandMenuItems: [{ ...pinnedCreationCommand, isPinned: false }],
      globalRecordCreationCommandMenuItems: globalCreationCommands,
      shouldDisplayGlobalRecordCreationCommands: true,
      contextObjectMetadataId: 'company',
    }),
  ).toEqual(globalCreationCommands);
});

it('does not pin an arbitrary object outside an object context', () => {
  expect(
    mergeGlobalRecordCreationCommandMenuItems({
      commandMenuItems: [pageCommand],
      globalRecordCreationCommandMenuItems: globalCreationCommands,
      shouldDisplayGlobalRecordCreationCommands: true,
    }),
  ).toEqual([pageCommand, ...globalCreationCommands]);
});

it('preserves the option to hide the contextual command short label', () => {
  const result = mergeGlobalRecordCreationCommandMenuItems({
    commandMenuItems: [{ ...pinnedCreationCommand, shortLabel: null }],
    globalRecordCreationCommandMenuItems: globalCreationCommands,
    shouldDisplayGlobalRecordCreationCommands: false,
    contextObjectMetadataId: 'company',
  });

  expect(result[0]).toMatchObject({
    label: 'Create Company',
    shortLabel: null,
    icon: 'IconPlus',
  });
});
