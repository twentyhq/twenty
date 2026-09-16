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
