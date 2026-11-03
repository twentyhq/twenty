import { Logger } from '@nestjs/common';

import { type CommandMenuItemManifest } from 'twenty-shared/application';
import {
  type UniversalConditionalDisplay,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { compileConditionalAvailabilityExpression } from 'twenty-shared/utils';

import { fromCommandMenuItemManifestToUniversalFlatCommandMenuItem } from 'src/engine/core-modules/application/application-manifest/converters/from-command-menu-item-manifest-to-universal-flat-command-menu-item.util';
import { type LegacyCommandMenuItemManifest } from 'src/engine/core-modules/application/application-manifest/types/legacy-command-menu-item-manifest.type';

const COMMAND_MENU_ITEM_MANIFEST: CommandMenuItemManifest = {
  universalIdentifier: '11111111-1111-4111-8111-111111111111',
  label: 'Escalate ticket',
  frontComponentUniversalIdentifier: '22222222-2222-4222-8222-222222222222',
};

const CONDITIONAL_AVAILABILITY: UniversalConditionalDisplay = {
  recordFilters: [
    {
      id: 'select-all-filter',
      contextKey: 'isSelectAll',
      operand: ViewFilterOperand.IS_NOT,
      value: 'true',
    },
  ],
};

const CONDITIONAL_PINNED: UniversalConditionalDisplay = {
  recordFilters: [
    {
      id: 'selected-records-filter',
      contextKey: 'numberOfSelectedRecords',
      operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
      value: '1',
    },
  ],
};

const build = (commandMenuItemManifest: LegacyCommandMenuItemManifest) =>
  fromCommandMenuItemManifestToUniversalFlatCommandMenuItem({
    commandMenuItemManifest,
    applicationUniversalIdentifier: '66666666-6666-4666-8666-666666666666',
    now: '2026-10-22T10:00:00.000Z',
  });

describe('fromCommandMenuItemManifestToUniversalFlatCommandMenuItem', () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    warnSpy = jest
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(() => undefined);
  });

  afterEach(() => warnSpy.mockRestore());

  it('carries the conditional availability and pinned trees onto the command menu item without a warning', () => {
    expect(
      build({
        ...COMMAND_MENU_ITEM_MANIFEST,
        conditionalAvailability: CONDITIONAL_AVAILABILITY,
        conditionalPinned: CONDITIONAL_PINNED,
      }),
    ).toMatchObject({
      universalConditionalAvailability: CONDITIONAL_AVAILABILITY,
      universalConditionalPinned: CONDITIONAL_PINNED,
    });
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('converts the formula strings of an older SDK build with the migration converter and warns to rebuild', () => {
    expect(
      build({
        ...COMMAND_MENU_ITEM_MANIFEST,
        conditionalAvailabilityExpression: 'not isSelectAll',
        conditionalPinnedExpression: 'numberOfSelectedRecords == 1',
      }),
    ).toMatchObject({
      universalConditionalAvailability:
        compileConditionalAvailabilityExpression('not isSelectAll'),
      universalConditionalPinned: compileConditionalAvailabilityExpression(
        'numberOfSelectedRecords == 1',
      ),
    });
    expect(warnSpy.mock.calls).toEqual([
      [
        'Command menu item "Escalate ticket" carries a conditionalAvailabilityExpression: Built with an older SDK. Rebuild to remove this warning.',
      ],
      [
        'Command menu item "Escalate ticket" carries a conditionalPinnedExpression: Built with an older SDK. Rebuild to remove this warning.',
      ],
    ]);
  });

  it('uses the trees and ignores the formula strings when a manifest carries both', () => {
    expect(
      build({
        ...COMMAND_MENU_ITEM_MANIFEST,
        conditionalAvailability: CONDITIONAL_AVAILABILITY,
        conditionalAvailabilityExpression: 'numberOfSelectedRecords >= 1',
        conditionalPinned: CONDITIONAL_PINNED,
        conditionalPinnedExpression: 'unknown formula',
      }),
    ).toMatchObject({
      universalConditionalAvailability: CONDITIONAL_AVAILABILITY,
      universalConditionalPinned: CONDITIONAL_PINNED,
    });
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('fails the install naming the item when a formula string cannot be converted', () => {
    expect(() =>
      build({
        ...COMMAND_MENU_ITEM_MANIFEST,
        conditionalPinnedExpression: 'arrayLength(selectedRecords) == 1',
      }),
    ).toThrow(
      'Command menu item "Escalate ticket" carries a conditionalPinnedExpression that cannot be converted: Cannot compile conditional availability expression "arrayLength(selectedRecords) == 1"',
    );
  });
});
