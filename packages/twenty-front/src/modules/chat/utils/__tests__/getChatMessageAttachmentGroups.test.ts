import { getChatMessageAttachmentGroups } from '@/chat/utils/getChatMessageAttachmentGroups';
import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';

const buildAttachment = (
  label: string,
  overrides: Partial<FieldFilesValue> = {},
): FieldFilesValue => ({
  fileId: label,
  label,
  extension: label.slice(label.lastIndexOf('.')),
  url: `https://api.example.com/file/${label}`,
  ...overrides,
});

const getLabels = (attachments: FieldFilesValue[]) =>
  attachments.map(({ label }) => label);

describe('getChatMessageAttachmentGroups', () => {
  it('keeps a single image as a standalone attachment', () => {
    const groups = getChatMessageAttachmentGroups([
      buildAttachment('chart.png'),
      buildAttachment('brief.pdf'),
    ]);

    expect(groups.gridImages).toEqual([]);
    expect(getLabels(groups.standaloneAttachments)).toEqual([
      'chart.png',
      'brief.pdf',
    ]);
  });

  it('groups several images into the grid and keeps other files apart', () => {
    const groups = getChatMessageAttachmentGroups([
      buildAttachment('chart.png'),
      buildAttachment('brief.pdf'),
      buildAttachment('team.jpg'),
      buildAttachment('logo.webp'),
    ]);

    expect(getLabels(groups.gridImages)).toEqual([
      'chart.png',
      'team.jpg',
      'logo.webp',
    ]);
    expect(getLabels(groups.standaloneAttachments)).toEqual(['brief.pdf']);
  });

  it('leaves images without a url or deleted out of the grid', () => {
    const groups = getChatMessageAttachmentGroups([
      buildAttachment('chart.png'),
      buildAttachment('pending.png', { url: '' }),
      buildAttachment('removed.png', { isDeleted: true }),
    ]);

    expect(groups.gridImages).toEqual([]);
    expect(getLabels(groups.standaloneAttachments)).toEqual([
      'chart.png',
      'pending.png',
      'removed.png',
    ]);
  });

  it('leaves images the preview cannot show out of the grid', () => {
    const groups = getChatMessageAttachmentGroups([
      buildAttachment('chart.png'),
      buildAttachment('logo.svg'),
      buildAttachment('team.jpg'),
      buildAttachment('favicon.ico'),
    ]);

    expect(getLabels(groups.gridImages)).toEqual(['chart.png', 'team.jpg']);
    expect(getLabels(groups.standaloneAttachments)).toEqual([
      'logo.svg',
      'favicon.ico',
    ]);
  });
});
