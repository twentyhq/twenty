import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsDataModelFieldRawJsonFormStory } from '@/settings/data-model/fields/forms/testing/SettingsDataModelFieldRawJsonFormStory';
import { type SettingsDataModelFieldRawJsonFormValues } from '@/settings/data-model/fields/forms/utils/settingsDataModelFieldRawJsonSchema';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { CatalogDecorator, type CatalogStory } from 'twenty-ui/testing';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { mockedUserData } from '~/testing/mock-data/users';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';

const objectMetadataItem = getMockObjectMetadataItemOrThrow('workflowRun');
const jsonFieldMetadataItem = getMockFieldMetadataItemOrThrow({
  objectMetadataItem,
  fieldName: 'state',
});

const seedSettingsForm = ({
  settings,
  isFeatureEnabled = true,
}: {
  settings?: SettingsDataModelFieldRawJsonFormValues['settings'];
  isFeatureEnabled?: boolean;
} = {}) => {
  setTestObjectMetadataItemsInMetadataStore(jotaiStore, [
    {
      ...objectMetadataItem,
      fields: objectMetadataItem.fields.map((field) =>
        field.id === jsonFieldMetadataItem.id ? { ...field, settings } : field,
      ),
    },
  ]);
  jotaiStore.set(currentWorkspaceState.atom, {
    ...mockedUserData.currentWorkspace,
    workspaceCustomApplication:
      mockedUserData.currentWorkspace.workspaceCustomApplication ?? null,
    installedApplications: [],
    featureFlags: [
      {
        key: FeatureFlagKey.IS_ON_DEMAND_FIELDS_ENABLED,
        value: isFeatureEnabled,
      },
    ],
  });
};

const meta: Meta<typeof SettingsDataModelFieldRawJsonFormStory> = {
  title: 'Modules/Settings/DataModel/SettingsDataModelFieldRawJsonForm',
  component: SettingsDataModelFieldRawJsonFormStory,
  args: {
    existingFieldMetadataId: jsonFieldMetadataItem.id,
    onSubmit: fn(),
  },
  beforeEach: () => seedSettingsForm(),
};

export default meta;
type Story = StoryObj<typeof SettingsDataModelFieldRawJsonFormStory>;

export const Catalog: CatalogStory<
  Story,
  typeof SettingsDataModelFieldRawJsonFormStory
> = {
  decorators: [CatalogDecorator],
  parameters: {
    catalog: {
      dimensions: [
        {
          name: 'disabled',
          values: [false, true],
          props: (disabled: boolean) => ({ disabled }),
        },
      ],
    },
  },
};

export const CustomJsonOptsInAndOut: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const toggle = await canvas.findByRole('switch', {
      name: 'Load value when opened',
    });
    expect(toggle).not.toBeChecked();
    await userEvent.click(toggle);
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(args.onSubmit).toHaveBeenLastCalledWith(
        { settings: { isValueLoadedOnOpen: true } },
        expect.anything(),
      ),
    );
    await userEvent.click(toggle);
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(args.onSubmit).toHaveBeenLastCalledWith(
        { settings: { isValueLoadedOnOpen: false } },
        expect.anything(),
      ),
    );
  },
};

export const ExistingSettingPreservesSiblingProperties: Story = {
  beforeEach: () =>
    seedSettingsForm({
      settings: { isValueLoadedOnOpen: true, integrationSetting: 'preserved' },
    }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const toggle = await canvas.findByRole('switch', {
      name: 'Load value when opened',
    });
    expect(toggle).toBeChecked();
    await userEvent.click(toggle);
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(args.onSubmit).toHaveBeenLastCalledWith(
        {
          settings: {
            isValueLoadedOnOpen: false,
            integrationSetting: 'preserved',
          },
        },
        expect.anything(),
      ),
    );
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    expect(
      await within(canvasElement).findByRole('switch', {
        name: 'Load value when opened',
      }),
    ).toHaveAttribute('aria-disabled', 'true');
  },
};

export const FeatureDisabled: Story = {
  beforeEach: () => seedSettingsForm({ isFeatureEnabled: false }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(await canvas.findByRole('button', { name: 'Save' })).toBeVisible();
    expect(canvas.queryByRole('switch')).not.toBeInTheDocument();
  },
};
