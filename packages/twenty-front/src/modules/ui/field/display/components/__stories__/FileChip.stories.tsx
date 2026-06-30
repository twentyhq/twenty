import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, fn, waitFor, within } from 'storybook/test';
import { FILE_CATEGORIES } from 'twenty-shared/types';
import { ComponentDecorator } from 'twenty-ui/testing';

import { FileChip } from '@/ui/field/display/components/FileChip';

const IMAGE_DATA_URI =
  'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 16 16%22%3E%3Crect width=%2216%22 height=%2216%22 fill=%22%231D4ED8%22/%3E%3Ccircle cx=%228%22 cy=%228%22 r=%224%22 fill=%22%23FFFFFF%22/%3E%3C/svg%3E';

const BROKEN_IMAGE_URL = 'https://example.invalid/missing-thumbnail.png';

const meta: Meta<typeof FileChip> = {
  title: 'UI/Field/Display/FileChip',
  component: FileChip,
  decorators: [ComponentDecorator],
  args: {
    onClick: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof FileChip>;

const getThumbnail = (canvasElement: HTMLElement) => {
  const thumbnail = canvasElement.querySelector('img');

  if (!(thumbnail instanceof HTMLImageElement)) {
    throw new Error('Expected image thumbnail to render');
  }

  return thumbnail;
};

export const ImageThumbnail: Story = {
  args: {
    file: {
      fileId: 'image-file-id',
      label: 'Logo.png',
      extension: 'png',
      url: IMAGE_DATA_URI,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Logo.png')).toBeVisible();
    expect(getThumbnail(canvasElement)).toHaveAttribute('src', IMAGE_DATA_URI);
  },
};

export const NonImageFileIcon: Story = {
  args: {
    file: {
      fileId: 'pdf-file-id',
      label: 'Contract.pdf',
      extension: 'pdf',
      fileCategory: FILE_CATEGORIES.TEXT_DOCUMENT,
      url: 'https://example.com/contract.pdf',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Contract.pdf')).toBeVisible();
    expect(canvasElement.querySelector('img')).toBeNull();
    expect(canvasElement.querySelector('svg')).not.toBeNull();
  },
};

export const EmptyLabelFallback: Story = {
  args: {
    file: {
      fileId: 'empty-label-file-id',
      label: '',
      extension: 'pdf',
      fileCategory: FILE_CATEGORIES.TEXT_DOCUMENT,
      url: 'https://example.com/legacy-file.pdf',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Untitled file')).toBeVisible();
    expect(canvasElement.querySelector('img')).toBeNull();
  },
};

export const BrokenImageThumbnailFallback: Story = {
  args: {
    file: {
      fileId: 'broken-image-file-id',
      label: 'Expired image.png',
      extension: 'png',
      fileCategory: FILE_CATEGORIES.IMAGE,
      url: BROKEN_IMAGE_URL,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const thumbnail = getThumbnail(canvasElement);

    expect(await canvas.findByText('Expired image.png')).toBeVisible();

    fireEvent.error(thumbnail);

    await waitFor(() => {
      expect(canvasElement.querySelector('img')).toBeNull();
      expect(canvasElement.querySelector('svg')).not.toBeNull();
    });
  },
};

export const DeletedImageFile: Story = {
  args: {
    file: {
      fileId: 'deleted-image-file-id',
      label: 'Deleted logo.png',
      extension: 'png',
      fileCategory: FILE_CATEGORIES.IMAGE,
      url: IMAGE_DATA_URI,
      isDeleted: true,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Deleted logo.png')).toBeVisible();
    expect(canvasElement.querySelector('img')).toBeNull();
  },
};
