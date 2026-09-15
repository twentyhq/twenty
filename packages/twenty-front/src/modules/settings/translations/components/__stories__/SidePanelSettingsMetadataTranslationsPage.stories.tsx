import {
  type Decorator,
  type Meta,
  type StoryObj,
} from '@storybook/react-vite';
import { HttpResponse, graphql } from 'msw';
import { within } from 'storybook/test';

import { SidePanelSettingsMetadataTranslationsPage } from '@/settings/translations/components/SidePanelSettingsMetadataTranslationsPage';
import { settingsTranslationsSidePanelTargetState } from '@/settings/translations/states/settingsTranslationsSidePanelTargetState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { ComponentDecorator } from 'twenty-ui/testing';
import { RootDecorator } from '~/testing/decorators/RootDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';

const TargetDecorator: Decorator = (Story) => {
  jotaiStore.set(settingsTranslationsSidePanelTargetState.atom, {
    metadataName: 'objectMetadata',
    recordId: 'object-metadata-id',
    label: 'Companies',
  });
  return <Story />;
};

const makeTranslationRow = ({
  locale,
  value,
  provenance,
}: {
  locale: string;
  value: string;
  provenance: string;
}) => ({
  metadataName: 'objectMetadata',
  recordId: 'object-metadata-id',
  objectMetadataId: null,
  property: 'labelPlural',
  locale,
  sourceValue: 'Companies',
  canonicalValue: 'Companies',
  value,
  provenance,
});

const meta: Meta<typeof SidePanelSettingsMetadataTranslationsPage> = {
  title:
    'Modules/Settings/Translations/SidePanelSettingsMetadataTranslationsPage',
  component: SidePanelSettingsMetadataTranslationsPage,
  decorators: [
    TargetDecorator,
    RootDecorator,
    ComponentDecorator,
    SnackBarDecorator,
  ],
  parameters: {
    msw: {
      handlers: [
        graphql.query('MetadataTranslations', () => {
          return HttpResponse.json({
            data: {
              metadataTranslations: [
                makeTranslationRow({
                  locale: 'en',
                  value: 'Companies',
                  provenance: 'INHERITED',
                }),
                makeTranslationRow({
                  locale: 'fr-FR',
                  value: 'Entreprises',
                  provenance: 'WORKSPACE',
                }),
                makeTranslationRow({
                  locale: 'es-ES',
                  value: 'Companies',
                  provenance: 'INHERITED',
                }),
              ],
            },
          });
        }),
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof SidePanelSettingsMetadataTranslationsPage>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // The section header carries the source text; rows are translations
    // only, and the workspace-edited row exposes its reset button.
    await canvas.findByText('Source: Companies');
    await canvas.findByText('Entreprises');
    await canvas.findByTitle('Reset to default');
  },
};
