import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, graphql } from 'msw';
import { expect, within } from 'storybook/test';

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
    await canvas.findByText('Entreprises');
    await canvas.findByTitle('Reset to default');
  },
};

const makeOptionLabelTranslationRow = ({
  locale,
  value,
  provenance,
}: {
  locale: string;
  value: string;
  provenance: string;
}) => ({
  metadataName: 'fieldMetadata',
  recordId: 'field-metadata-id',
  objectMetadataId: 'object-metadata-id',
  property: 'options.week-option-id.label',
  locale,
  sourceValue: 'Неделя',
  canonicalValue: 'Неделя',
  value,
  provenance,
});

export const FieldWithOptions: Story = {
  args: {
    input: { fieldMetadataId: 'field-metadata-id' },
  },
  parameters: {
    msw: {
      handlers: [
        graphql.query('MetadataTranslations', () => {
          return HttpResponse.json({
            data: {
              metadataTranslations: [
                makeOptionLabelTranslationRow({
                  locale: 'en',
                  value: 'Week',
                  provenance: 'WORKSPACE',
                }),
                makeOptionLabelTranslationRow({
                  locale: 'fr-FR',
                  value: 'Неделя',
                  provenance: 'INHERITED',
                }),
              ],
            },
          });
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Options');
    await canvas.findByText('Week');
    expect(await canvas.findAllByText('Неделя')).toHaveLength(2);
  },
};
