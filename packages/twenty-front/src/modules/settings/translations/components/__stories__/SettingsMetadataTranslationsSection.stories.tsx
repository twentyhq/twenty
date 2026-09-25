import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, graphql } from 'msw';
import { within } from 'storybook/test';

import { SettingsMetadataTranslationsSection } from '@/settings/translations/components/SettingsMetadataTranslationsSection';
import { ComponentDecorator } from 'twenty-ui/testing';
import { RootDecorator } from '~/testing/decorators/RootDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';

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

const meta: Meta<typeof SettingsMetadataTranslationsSection> = {
  title: 'Modules/Settings/Translations/SettingsMetadataTranslationsSection',
  component: SettingsMetadataTranslationsSection,
  decorators: [RootDecorator, ComponentDecorator, ToastDecorator],
  args: {
    input: { objectMetadataId: 'object-metadata-id' },
  },
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
type Story = StoryObj<typeof SettingsMetadataTranslationsSection>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Languages');
    await canvas.findByText('Source');
    await canvas.findByText('Entreprises');
    await canvas.findByTitle('Reset to default');
  },
};
