import { interpolateCommandMenuItemFields } from '@/command-menu-item/display/utils/interpolateCommandMenuItemFields';
import { EMPTY_COMMAND_MENU_CONTEXT_API } from '@/command-menu-item/constants/EmptyCommandMenuContextApi';
import { type CommandMenuContextApi } from 'twenty-shared/types';
import { type CommandMenuItemFieldsFragment } from '~/generated-metadata/graphql';

const buildContextApi = (
  overrides: Partial<CommandMenuContextApi>,
): CommandMenuContextApi => ({
  ...EMPTY_COMMAND_MENU_CONTEXT_API,
  ...overrides,
});

type CommandMenuItemDisplayFields = Pick<
  CommandMenuItemFieldsFragment,
  'label' | 'shortLabel' | 'icon'
>;

const buildItem = (
  overrides: Partial<CommandMenuItemDisplayFields>,
): CommandMenuItemDisplayFields => ({
  label: '',
  shortLabel: null,
  icon: null,
  ...overrides,
});

describe('interpolateCommandMenuItemFields', () => {
  it('fills the placeholders of the object page the user is on', () => {
    const result = interpolateCommandMenuItemFields(
      buildItem({
        label: 'Create new {objectLabelSingular}',
        shortLabel: 'New {objectLabelSingular}',
      }),
      buildContextApi({
        objectMetadataItem: { labelSingular: 'widget', labelPlural: 'widgets' },
      }),
    );

    expect(result.label).toBe('Create new Widget');
    expect(result.shortLabel).toBe('New Widget');
  });

  it('follows the selection for objectLabel', () => {
    expect(
      interpolateCommandMenuItemFields(
        buildItem({ label: 'Delete {objectLabel}' }),
        buildContextApi({ objectMetadataLabel: 'people' }),
      ).label,
    ).toBe('Delete People');
  });

  it('leaves a label without placeholders untouched', () => {
    expect(
      interpolateCommandMenuItemFields(
        buildItem({ label: 'Add to Favorites' }),
        buildContextApi({}),
      ).label,
    ).toBe('Add to Favorites');
  });

  // Navigation items are filled server-side against their target object, so
  // the client must not blank out what it cannot resolve.
  it('leaves placeholders it cannot fill intact', () => {
    expect(
      interpolateCommandMenuItemFields(
        buildItem({ label: 'Create new {objectLabelSingular}' }),
        buildContextApi({ objectMetadataItem: {} }),
      ).label,
    ).toBe('Create new {objectLabelSingular}');
  });
});
