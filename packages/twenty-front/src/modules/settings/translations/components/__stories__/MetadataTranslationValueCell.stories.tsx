import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { MetadataTranslationValueCell } from '@/settings/translations/components/MetadataTranslationValueCell';
import { type MetadataTranslationRow } from '@/settings/translations/hooks/useMetadataTranslations';
import { ComponentDecorator } from 'twenty-ui/testing';
import { MetadataTranslationProvenance } from '~/generated-metadata/graphql';

const onSaveMockFunction = fn();

const translatedRow: MetadataTranslationRow = {
  metadataName: 'objectMetadata',
  recordId: 'object-metadata-id',
  objectMetadataId: null,
  property: 'labelPlural',
  locale: 'fr-FR',
  sourceValue: 'Companies',
  canonicalValue: 'Companies',
  value: 'Entreprises',
  provenance: MetadataTranslationProvenance.WORKSPACE,
};

const inheritedRow: MetadataTranslationRow = {
  ...translatedRow,
  locale: 'es-ES',
  value: 'Companies',
  provenance: MetadataTranslationProvenance.INHERITED,
};

const meta: Meta<typeof MetadataTranslationValueCell> = {
  title: 'Modules/Settings/Translations/MetadataTranslationValueCell',
  component: MetadataTranslationValueCell,
  decorators: [ComponentDecorator],
  args: {
    row: translatedRow,
    onSave: onSaveMockFunction,
  },
};

export default meta;
type Story = StoryObj<typeof MetadataTranslationValueCell>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Entreprises');
  },
};

export const Inherited: Story = {
  args: {
    row: inheritedRow,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Companies');
  },
};

export const Editing: Story = {
  play: async ({ canvasElement }) => {
    onSaveMockFunction.mockClear();

    const canvas = within(canvasElement);

    const value = await canvas.findByText('Entreprises');

    await userEvent.click(value);

    const input = await canvas.findByRole('textbox');

    await userEvent.clear(input);
    await userEvent.type(input, 'Sociétés{enter}');

    await expect(onSaveMockFunction).toHaveBeenCalledWith('Sociétés');
  },
};
