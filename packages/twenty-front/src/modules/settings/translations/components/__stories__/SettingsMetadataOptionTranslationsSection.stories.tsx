import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, graphql } from 'msw';
import { expect, within } from 'storybook/test';

import { SettingsMetadataOptionTranslationsSection } from '@/settings/translations/components/SettingsMetadataOptionTranslationsSection';
import { ComponentDecorator } from 'twenty-ui/testing';
import { RootDecorator } from '~/testing/decorators/RootDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';

const makeTranslationRow = ({
  property,
  sourceValue,
  value,
  provenance,
}: {
  property: string;
  sourceValue: string;
  value: string;
  provenance: string;
}) => ({
  metadataName: 'fieldMetadata',
  recordId: 'field-metadata-id',
  objectMetadataId: 'object-metadata-id',
  property,
  locale: 'en',
  sourceValue,
  canonicalValue: sourceValue,
  value,
  provenance,
});

const meta: Meta<typeof SettingsMetadataOptionTranslationsSection> = {
  title:
    'Modules/Settings/Translations/SettingsMetadataOptionTranslationsSection',
  component: SettingsMetadataOptionTranslationsSection,
  decorators: [RootDecorator, ComponentDecorator, ToastDecorator],
  args: {
    fieldMetadataId: 'field-metadata-id',
  },
  parameters: {
    msw: {
      handlers: [
        graphql.query('MetadataTranslations', () => {
          return HttpResponse.json({
            data: {
              metadataTranslations: [
                makeTranslationRow({
                  property: 'label',
                  sourceValue: 'Период',
                  value: 'Period',
                  provenance: 'WORKSPACE',
                }),
                makeTranslationRow({
                  property: 'options.week-option-id.label',
                  sourceValue: 'Неделя',
                  value: 'Week',
                  provenance: 'WORKSPACE',
                }),
                makeTranslationRow({
                  property: 'options.month-option-id.label',
                  sourceValue: 'Месяц',
                  value: 'Месяц',
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
type Story = StoryObj<typeof SettingsMetadataOptionTranslationsSection>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Options');
    await canvas.findByText('Неделя');
    await canvas.findByText('Week');
    await canvas.findByTitle('Reset to default');
    expect(canvas.queryByText('Period')).toBeNull();
  },
};
