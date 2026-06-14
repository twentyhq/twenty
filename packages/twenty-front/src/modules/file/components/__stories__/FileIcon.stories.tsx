import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, waitFor } from 'storybook/test';
import { FILE_CATEGORIES } from 'twenty-shared/types';
import { ComponentDecorator } from 'twenty-ui/testing';

import { FileIcon } from '@/file/components/FileIcon';

const IMAGE_DATA_URI =
  'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 16 16%22%3E%3Crect width=%2216%22 height=%2216%22 fill=%22%231D4ED8%22/%3E%3Ccircle cx=%228%22 cy=%228%22 r=%224%22 fill=%22%23FFFFFF%22/%3E%3C/svg%3E';

const BROKEN_IMAGE_URL = 'https://example.invalid/missing-thumbnail.png';

const meta: Meta<typeof FileIcon> = {
  title: 'UI/File/FileIcon',
  component: FileIcon,
  decorators: [ComponentDecorator],
};

export default meta;

type Story = StoryObj<typeof FileIcon>;

export const ImageThumbnail: Story = {
  args: {
    fileCategory: FILE_CATEGORIES.IMAGE,
    size: 'small',
    thumbnailUrl: IMAGE_DATA_URI,
  },
  play: async ({ canvasElement }) => {
    const thumbnail = canvasElement.querySelector('img');

    expect(thumbnail).not.toBeNull();
    expect(thumbnail).toHaveAttribute('src', IMAGE_DATA_URI);
  },
};

export const NonImageRendersIcon: Story = {
  args: {
    fileCategory: FILE_CATEGORIES.TEXT_DOCUMENT,
    size: 'small',
    thumbnailUrl: 'https://example.com/contract.pdf',
  },
  play: async ({ canvasElement }) => {
    expect(canvasElement.querySelector('img')).toBeNull();
    expect(canvasElement.querySelector('svg')).not.toBeNull();
  },
};

export const ImageWithoutUrlRendersIcon: Story = {
  args: {
    fileCategory: FILE_CATEGORIES.IMAGE,
    size: 'small',
  },
  play: async ({ canvasElement }) => {
    expect(canvasElement.querySelector('img')).toBeNull();
    expect(canvasElement.querySelector('svg')).not.toBeNull();
  },
};

export const BrokenThumbnailFallsBackToIcon: Story = {
  args: {
    fileCategory: FILE_CATEGORIES.IMAGE,
    size: 'small',
    thumbnailUrl: BROKEN_IMAGE_URL,
  },
  play: async ({ canvasElement }) => {
    const thumbnail = canvasElement.querySelector('img');

    expect(thumbnail).not.toBeNull();

    fireEvent.error(thumbnail as HTMLImageElement);

    await waitFor(() => {
      expect(canvasElement.querySelector('img')).toBeNull();
      expect(canvasElement.querySelector('svg')).not.toBeNull();
    });
  },
};

export const MediumImageThumbnail: Story = {
  args: {
    fileCategory: FILE_CATEGORIES.IMAGE,
    size: 'medium',
    thumbnailUrl: IMAGE_DATA_URI,
  },
  play: async ({ canvasElement }) => {
    const thumbnail = canvasElement.querySelector('img');

    expect(thumbnail).not.toBeNull();
    expect(thumbnail).toHaveAttribute('src', IMAGE_DATA_URI);
  },
};
