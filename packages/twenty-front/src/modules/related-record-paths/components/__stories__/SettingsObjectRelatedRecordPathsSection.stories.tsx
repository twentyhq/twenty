import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse } from 'msw';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { isDefined } from 'twenty-shared/utils';
import { ComponentDecorator } from 'twenty-ui/testing';

import { SettingsObjectRelatedRecordPathsSection } from '@/related-record-paths/components/SettingsObjectRelatedRecordPathsSection';
import { IconsProviderDecorator } from '~/testing/decorators/IconsProviderDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { graphqlMocks, metadataGraphql } from '~/testing/graphqlMocks';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const company = getMockObjectMetadataItemOrThrow('company');
const noteTarget = getMockObjectMetadataItemOrThrow('noteTarget');

const getFieldMetadataId = ({
  objectMetadataItem,
  fieldName,
}: {
  objectMetadataItem: Pick<typeof company, 'fields'>;
  fieldName: string;
}) => {
  const field = objectMetadataItem.fields.find(
    (candidate) => candidate.name === fieldName,
  );

  if (!isDefined(field)) {
    throw new Error(`Field ${fieldName} not found`);
  }

  return field.id;
};

const RELATED_RECORD_PATHS = [
  {
    __typename: 'RelatedRecordPath',
    id: 'c6c3a4b1-0b0e-4c55-9c39-6f3f0f0c0a01',
    objectMetadataId: company.id,
    firstFieldMetadataId: getFieldMetadataId({
      objectMetadataItem: company,
      fieldName: 'attachments',
    }),
    secondFieldMetadataId: null,
    thirdFieldMetadataId: null,
    isInherent: true,
  },
  {
    __typename: 'RelatedRecordPath',
    id: 'c6c3a4b1-0b0e-4c55-9c39-6f3f0f0c0a02',
    objectMetadataId: company.id,
    firstFieldMetadataId: getFieldMetadataId({
      objectMetadataItem: company,
      fieldName: 'noteTargets',
    }),
    secondFieldMetadataId: getFieldMetadataId({
      objectMetadataItem: noteTarget,
      fieldName: 'note',
    }),
    thirdFieldMetadataId: null,
    isInherent: false,
  },
];

const createRelatedRecordPath = fn();

const meta: Meta<typeof SettingsObjectRelatedRecordPathsSection> = {
  title: 'Modules/RelatedRecordPaths/SettingsObjectRelatedRecordPathsSection',
  component: SettingsObjectRelatedRecordPathsSection,
  decorators: [
    ComponentDecorator,
    IconsProviderDecorator,
    ObjectMetadataItemsDecorator,
    ToastDecorator,
  ],
  args: {
    objectMetadataItem: company,
    isReadOnly: false,
  },
  parameters: {
    msw: {
      handlers: [
        metadataGraphql.query('FindManyRelatedRecordPaths', () =>
          HttpResponse.json({
            data: { relatedRecordPaths: RELATED_RECORD_PATHS },
          }),
        ),
        metadataGraphql.mutation('CreateRelatedRecordPath', ({ variables }) => {
          createRelatedRecordPath(variables.input);

          return HttpResponse.json({
            data: {
              createRelatedRecordPath: {
                __typename: 'RelatedRecordPath',
                id: 'c6c3a4b1-0b0e-4c55-9c39-6f3f0f0c0a03',
                secondFieldMetadataId: null,
                thirdFieldMetadataId: null,
                ...variables.input,
              },
            },
          });
        }),
        ...graphqlMocks.handlers,
      ],
    },
  },
};

export default meta;

type Story = StoryObj<typeof SettingsObjectRelatedRecordPathsSection>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Notes › Note')).toBeVisible();
    expect(canvas.queryByText('Inherent')).not.toBeInTheDocument();
  },
};

export const ReadOnly: Story = {
  args: { isReadOnly: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Notes › Note')).toBeVisible();
    expect(
      canvas.queryByRole('button', { name: 'Add path' }),
    ).not.toBeInTheDocument();
    expect(
      canvas.queryByRole('button', { name: 'Delete related record path' }),
    ).not.toBeInTheDocument();
  },
};

export const AddPathThroughRelations: Story = {
  beforeEach: () => {
    createRelatedRecordPath.mockClear();
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Add path' }),
    );

    const search = await body.findByRole('searchbox', {
      name: 'Search relations',
    });

    await userEvent.type(search, 'Notes');
    await userEvent.click(await body.findByRole('button', { name: /^Notes/ }));

    expect(
      await body.findByRole('button', { name: /Add this path/ }),
    ).toBeVisible();

    await userEvent.type(
      await body.findByRole('searchbox', { name: 'Search relations' }),
      'Note',
    );
    await userEvent.click(await body.findByRole('button', { name: /^Note/ }));
    await userEvent.click(
      await body.findByRole('button', { name: /Add this path/ }),
    );

    await waitFor(() =>
      expect(createRelatedRecordPath).toHaveBeenCalledTimes(1),
    );
    await waitFor(() =>
      expect(createRelatedRecordPath).toHaveBeenCalledWith({
        objectMetadataId: company.id,
        firstFieldMetadataId: getFieldMetadataId({
          objectMetadataItem: company,
          fieldName: 'noteTargets',
        }),
        secondFieldMetadataId: getFieldMetadataId({
          objectMetadataItem: noteTarget,
          fieldName: 'note',
        }),
        isInherent: false,
      }),
    );
  },
};
